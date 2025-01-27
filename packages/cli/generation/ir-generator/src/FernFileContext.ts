import { RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { FernFilepath, FernFilepathV2 } from "@fern-fern/ir-model/commons";
import { TypeReference } from "@fern-fern/ir-model/types";
import { mapValues } from "lodash-es";
import { CasingsGenerator } from "./casings/CasingsGenerator";
import { convertToFernFilepath, convertToFernFilepathV2 } from "./utils/convertToFernFilepath";
import { parseInlineType } from "./utils/parseInlineType";

/**
 * here is a description
 */
export interface FernFileContext {
    relativeFilepath: RelativeFilePath;
    fernFilepath: FernFilepath;
    fernFilepathV2: FernFilepathV2;
    imports: Record<string, RelativeFilePath>;
    serviceFile: ServiceFileSchema;
    parseTypeReference: (type: string | { type: string }) => TypeReference;
    casingsGenerator: CasingsGenerator;
}

export function constructFernFileContext({
    relativeFilepath,
    serviceFile,
    casingsGenerator,
}: {
    relativeFilepath: RelativeFilePath | undefined;
    serviceFile: ServiceFileSchema;
    casingsGenerator: CasingsGenerator;
}): FernFileContext {
    const file: FernFileContext = {
        relativeFilepath: relativeFilepath != null ? RelativeFilePath.of(relativeFilepath) : ".",
        fernFilepath: relativeFilepath != null ? convertToFernFilepath({ relativeFilepath, casingsGenerator }) : [],
        fernFilepathV2: relativeFilepath != null ? convertToFernFilepathV2({ relativeFilepath, casingsGenerator }) : [],
        imports: mapValues(serviceFile.imports ?? {}, RelativeFilePath.of),
        serviceFile,
        parseTypeReference: (type) => {
            const typeAsString = typeof type === "string" ? type : type.type;
            return parseInlineType({ type: typeAsString, file });
        },
        casingsGenerator,
    };
    return file;
}
