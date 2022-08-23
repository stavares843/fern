import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import {
    DEFINITION_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    ROOT_API_FILENAME,
} from "@fern-api/project-configuration";
import { RootApiFileSchema } from "@fern-api/yaml-schema";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { SAMPLE_IMDB_API } from "./sampleImdbApi";

export async function createWorkspace({
    directoryOfWorkspace,
}: {
    directoryOfWorkspace: AbsoluteFilePath;
}): Promise<void> {
    await mkdir(directoryOfWorkspace);
    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)),
    });
    await writeSampleApiDefinition({
        directoryOfDefinition: join(directoryOfWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY)),
    });
}

const API_WORKSPACE_DEFINITION: GeneratorsConfigurationSchema = {
    generators: [],
};

async function writeGeneratorsConfiguration({ filepath }: { filepath: AbsoluteFilePath }): Promise<void> {
    await writeFile(filepath, yaml.dump(API_WORKSPACE_DEFINITION));
}

const ROOT_API: RootApiFileSchema = {
    name: "api",
};

async function writeSampleApiDefinition({
    directoryOfDefinition,
}: {
    directoryOfDefinition: AbsoluteFilePath;
}): Promise<void> {
    await mkdir(directoryOfDefinition);
    await writeFile(join(directoryOfDefinition, RelativeFilePath.of(ROOT_API_FILENAME)), yaml.dump(ROOT_API));
    await writeFile(join(directoryOfDefinition, RelativeFilePath.of("imdb.yml")), SAMPLE_IMDB_API);
}