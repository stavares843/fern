import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";

export async function getIrForApi(absolutePathToWorkspace: AbsoluteFilePath): Promise<IntermediateRepresentation> {
    const context = createMockTaskContext();
    const workspace = await loadWorkspace({ absolutePathToWorkspace, context });
    if (!workspace.didSucceed) {
        return context.failAndThrow("Failed to load workspace", workspace.failures);
    }
    return generateIntermediateRepresentation({
        workspace: workspace.workspace,
        generationLanguage: undefined,
        audiences: undefined,
    });
}
