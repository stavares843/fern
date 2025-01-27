import { addPrefixToString } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { FernCliError } from "@fern-api/task-context";

export function logErrorMessage({
    message,
    error,
    logger,
}: {
    message: string | undefined;
    error: unknown;
    logger: Logger;
}): void {
    if (message != null) {
        logger.error(message);
    }

    if (
        error == null ||
        // thrower is responsible for logging, so we don't need to log here
        error instanceof FernCliError
    ) {
        return;
    }

    const errorMessage = convertErrorToString(error);
    if (errorMessage != null) {
        logger.error(
            addPrefixToString({
                prefix: "  ",
                content: errorMessage,
                includePrefixOnAllLines: true,
            })
        );
    }

    logger.debug(JSON.stringify(error));
}

function convertErrorToString(error: unknown): string | undefined {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        return error.stack ?? error.message;
    }
    return undefined;
}
