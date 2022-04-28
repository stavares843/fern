import { NamedType, SingleUnionType, TypeReference } from "@fern-api/api";
import {
    generateNamedTypeReference,
    generateTypeReference,
    ResolvedType,
    TypeResolver,
} from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { Directory, SourceFile } from "ts-morph";
import { SingleUnionTypeWithResolvedValueType } from "./generateUnionType";

export function getKeyForUnion({ discriminantValue }: SingleUnionType): string {
    return upperFirst(discriminantValue);
}

export function getResolvedTypeForSingleUnionType({
    singleUnionType,
    typeResolver,
    file,
    modelDirectory,
}: {
    singleUnionType: SingleUnionType;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): SingleUnionTypeWithResolvedValueType["resolvedValueType"] | undefined {
    return visitResolvedTypeReference<SingleUnionTypeWithResolvedValueType["resolvedValueType"]>(
        singleUnionType.valueType,
        typeResolver,
        {
            namedObject: (named) => {
                return {
                    type: generateNamedTypeReference({
                        typeName: named,
                        referencedIn: file,
                        baseDirectory: modelDirectory,
                    }),
                    isExtendable: true,
                };
            },
            nonObject: () => {
                return {
                    type: generateTypeReference({
                        reference: singleUnionType.valueType,
                        referencedIn: file,
                        modelDirectory,
                    }),
                    isExtendable: false,
                };
            },
            void: () => undefined,
        }
    );
}

export function visitResolvedTypeReference<R>(
    typeReference: TypeReference,
    typeResolver: TypeResolver,
    visitor: TypeReferenceVisitor<R>
): R {
    return TypeReference._visit(typeReference, {
        named: (named) => {
            const resolved = typeResolver.resolveNamedType(named);
            return ResolvedType._visit(resolved, {
                object: () => visitor.namedObject(named),
                union: visitor.nonObject,
                enum: visitor.nonObject,
                container: visitor.nonObject,
                primitive: visitor.nonObject,
                void: visitor.void,
                unknown: () => {
                    throw new Error("Unexpected resolved type: " + resolved._type);
                },
            });
        },
        primitive: () => visitor.nonObject(),
        container: () => visitor.nonObject(),
        void: () => visitor.void(),
        unknown: () => {
            throw new Error("Unexpected type reference: " + typeReference._type);
        },
    });
}

export interface TypeReferenceVisitor<R> {
    namedObject: (typeName: NamedType) => R;
    nonObject: () => R;
    void: () => R;
}