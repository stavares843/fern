import { FernServiceUtils } from "@fern-typescript/declaration-handler";
import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";

export class FernServiceUtilsImpl extends ExternalDependency implements FernServiceUtils {
    protected PACKAGE = {
        name: "@fern-typescript/service-utils",
        version: "0.0.173-7-ge9345cba",
    };
    protected TYPES_PACKAGE = undefined;

    public readonly Supplier = this.withNamedImport(
        "Supplier",
        (addImport, supplierType) =>
            ({
                _getReferenceToType: (typeArgument: ts.TypeNode) => {
                    addImport();
                    return ts.factory.createTypeReferenceNode(supplierType, [typeArgument]);
                },

                get: (supplierExpression: ts.Expression) => {
                    addImport();
                    return ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(supplierType),
                                ts.factory.createIdentifier("get")
                            ),
                            undefined,
                            [supplierExpression]
                        )
                    );
                },
            } as const)
    );

    public readonly _Response = this.withNamedImport(
        "_Response",
        (addImport, responseType) =>
            ({
                _getReferenceToType: (successType: ts.TypeNode, failureType: ts.TypeNode) => {
                    addImport();
                    return ts.factory.createTypeReferenceNode(responseType, [successType, failureType]);
                },

                OK_DISCRIMINANT: "ok",
                Success: {
                    BODY_PROPERTY_NAME: "body",
                },
                Failure: {
                    BODY_PROPERTY_NAME: "error",
                },
            } as const)
    );

    public readonly Fetcher = this.withNamedImport(
        "FetcherV2",
        (addImport, Fetcher) =>
            ({
                _getReferenceToType: () => {
                    addImport();
                    return ts.factory.createTypeReferenceNode(Fetcher);
                },

                Parameters: {
                    URL: "url",
                    METHOD: "method",
                    HEADERS: "headers",
                    QUERY_PARAMS: "queryParameters",
                    AUTH_HEADER: "authHeader",
                    BODY: "body",
                },

                ReturnValue: {
                    OK: "ok",
                    BODY: "body",
                },
            } as const)
    );

    public readonly defaultFetcher = this.withNamedImport(
        "defaultFetcherV2",
        (addImport, defaultFetcher) => (fetcherArgs: ts.Expression) => {
            addImport();
            return ts.factory.createCallExpression(ts.factory.createIdentifier(defaultFetcher), undefined, [
                fetcherArgs,
            ]);
        }
    );

    public readonly NetworkError = this.withNamedImport("_NetworkError", (addImport, networkErrorType) => ({
        ERROR_NAME: "_network",

        _getReferenceToType: () => {
            addImport();
            return ts.factory.createTypeReferenceNode(networkErrorType);
        },
    }));

    public readonly UnknownError = this.withNamedImport("_UnknownError", (addImport, unknownErrorType) => ({
        _getReferenceToType: () => {
            addImport();
            return ts.factory.createTypeReferenceNode(unknownErrorType);
        },
    }));
}