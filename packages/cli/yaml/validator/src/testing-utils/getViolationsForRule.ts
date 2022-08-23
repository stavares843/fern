import { AbsoluteFilePath, entries } from "@fern-api/core-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import stripAnsi from "strip-ansi";
import { createAstVisitorForRules } from "../createAstVisitorForRules";
import { Rule, RuleViolation } from "../Rule";

export declare namespace getViolationsForRule {
    export interface Args {
        rule: Rule;
        absolutePathToWorkspace: AbsoluteFilePath;
    }
}

export async function getViolationsForRule({
    rule,
    absolutePathToWorkspace,
}: getViolationsForRule.Args): Promise<RuleViolation[]> {
    const parseResult = await loadWorkspace({
        absolutePathToWorkspace,
    });
    if (!parseResult.didSucceed) {
        throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
    }

    const ruleRunner = await rule.create({ workspace: parseResult.workspace, logger: NOOP_LOGGER });
    const violations: RuleViolation[] = [];

    for (const [relativeFilePath, contents] of entries(parseResult.workspace.serviceFiles)) {
        const visitor = createAstVisitorForRules({
            relativeFilePath,
            contents,
            ruleRunners: [ruleRunner],
            addViolations: (newViolations) => {
                violations.push(...newViolations);
            },
        });
        await visitFernYamlAst(contents, visitor);
    }

    return violations.map((violation) => ({
        ...violation,
        message: stripAnsi(violation.message),
    }));
}