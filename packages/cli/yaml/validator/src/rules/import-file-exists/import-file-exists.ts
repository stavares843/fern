import { dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

export const ImportFileExistsRule: Rule = {
    name: "import-file-exists",
    create: ({ workspace }) => {
        return {
            serviceFile: {
                import: async ({ importedAs, importPath }, { relativeFilepath }) => {
                    const violations: RuleViolation[] = [];
                    const importedFilePath = join(
                        workspace.absolutePathToDefinition,
                        dirname(relativeFilepath),
                        RelativeFilePath.of(importPath)
                    );
                    const fileExists = await doesPathExist(importedFilePath);
                    if (!fileExists) {
                        violations.push({
                            severity: "error",
                            message: `Import ${chalk.bold(importedAs)} points to non-existent path ${chalk.bold(
                                importPath
                            )}.`,
                        });
                    }
                    return violations;
                },
            },
        };
    },
};
