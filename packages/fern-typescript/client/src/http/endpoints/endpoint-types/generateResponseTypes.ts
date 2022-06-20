import { HttpEndpoint, NamedType } from "@fern-api/api";
import { DependencyManager, getTextOfTsKeyword, TypeResolver } from "@fern-typescript/commons";
import { generateResponse, getServiceTypeReference } from "@fern-typescript/service-types";
import { Directory, ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { GeneratedEndpointTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        serviceName: NamedType;
        endpoint: HttpEndpoint;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedEndpointTypes["response"];
}

export function generateResponseTypes({
    serviceName,
    endpoint,
    endpointDirectory,
    modelDirectory,
    servicesDirectory,
    typeResolver,
    dependencyManager,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference } = generateResponse({
        modelDirectory,
        typeResolver,
        dependencyManager,
        successResponse: {
            type: endpoint.response.ok.type,
            docs: endpoint.response.ok.docs,
        },
        failedResponse: endpoint.response.failed,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            getServiceTypeReference({
                serviceOrChannelName: serviceName,
                endpointOrOperationId: endpoint.endpointId,
                reference,
                referencedIn,
                servicesDirectory,
                modelDirectory,
            }),
        directory: endpointDirectory,
        additionalProperties: [
            {
                name: ClientConstants.HttpService.Endpoint.Types.Response.Properties.STATUS_CODE,
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
            },
        ],
    });

    return { reference, successBodyReference };
}
