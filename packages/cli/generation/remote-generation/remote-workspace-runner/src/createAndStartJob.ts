import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { migrateIntermediateRepresentation } from "@fern-api/ir-migrations";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import urlJoin from "url-join";
import { FIDDLE_ORIGIN, REMOTE_GENERATION_SERVICE } from "./service";
import { substituteEnvVariables } from "./substituteEnvVariables";

export async function createAndStartJob({
    workspace,
    organization,
    intermediateRepresentation,
    generatorInvocation,
    version,
    context,
}: {
    workspace: Workspace;
    organization: string;
    intermediateRepresentation: IntermediateRepresentation;
    generatorInvocation: GeneratorInvocation;
    version: string | undefined;
    context: TaskContext;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const job = await createJob({ workspace, organization, generatorInvocation, version, context });
    await startJob({ intermediateRepresentation, job, context, generatorInvocation });
    return job;
}

async function createJob({
    workspace,
    organization,
    generatorInvocation,
    version,
    context,
}: {
    workspace: Workspace;
    organization: string;
    generatorInvocation: GeneratorInvocation;
    version: string | undefined;
    context: TaskContext;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const generatorConfig: FernFiddle.GeneratorConfigV2 = {
        id: generatorInvocation.name,
        version: generatorInvocation.version,
        outputMode: generatorInvocation.outputMode,
        customConfig: generatorInvocation.config,
    };
    const generatorConfigsWithEnvVarSubstitutions = substituteEnvVariables(generatorConfig, context);
    const createResponse = await REMOTE_GENERATION_SERVICE.remoteGen.createJobV2({
        apiName: workspace.name,
        version,
        organizationName: organization,
        generators: [generatorConfigsWithEnvVarSubstitutions],
    });

    if (!createResponse.ok) {
        return createResponse.error._visit({
            illegalApiNameError: () => {
                return context.failAndThrow("API name is invalid: " + workspace.name);
            },
            cannotPublishToNpmScope: ({ validScope, invalidScope }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidScope} (expected ${validScope})`
                );
            },
            cannotPublishToMavenGroup: ({ validGroup, invalidGroup }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidGroup} (expected ${validGroup})`
                );
            },
            generatorsDoNotExistError: (value) => {
                return context.failAndThrow(
                    "Generators do not exist: " +
                        value.nonExistentGenerators
                            .map((generator) => `${generator.id}@${generator.version}`)
                            .join(", ")
                );
            },
            insufficientPermissions: () => {
                return context.failAndThrow("Insufficient permissions. Do you have a token set in generators.yml?");
            },
            _other: (content) => {
                return context.failAndThrow("Failed to create job", content);
            },
        });
    }

    return createResponse.body;
}

async function startJob({
    intermediateRepresentation,
    generatorInvocation,
    job,
    context,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    generatorInvocation: GeneratorInvocation;
    job: FernFiddle.remoteGen.CreateJobResponse;
    context: TaskContext;
}): Promise<void> {
    const formData = new FormData();

    const migratedIntermediateRepresentation = migrateIntermediateRepresentation({
        generatorName: generatorInvocation.name,
        generatorVersion: generatorInvocation.version,
        intermediateRepresentation,
    });
    formData.append("file", JSON.stringify(migratedIntermediateRepresentation));

    const url = urlJoin(FIDDLE_ORIGIN, `/api/remote-gen/jobs/${job.jobId}/start`);
    try {
        await axios.post(url, formData, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
            },
        });
    } catch (error) {
        const errorBody = error instanceof AxiosError ? error.response?.data : error;
        context.failAndThrow("Failed to start job", errorBody);
    }
}
