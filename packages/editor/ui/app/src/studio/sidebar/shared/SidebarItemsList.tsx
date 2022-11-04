import { ReactElement, useMemo } from "react";
import { DraftSidebarItemId } from "../context/SidebarContext";
import { useSidebarContext } from "../context/useSidebarContext";

export declare namespace SidebarItemsList {
    export interface Props<Item, DraftId extends DraftSidebarItemId> {
        items: Item[];
        renderItem: (item: Item) => JSX.Element;
        parseDraftId: (draft: DraftSidebarItemId) => DraftId | undefined;
        doesDraftBelongInList: (draft: DraftId) => boolean;
        convertDraftToItem: (draft: DraftId) => Item | undefined;
    }
}

export function SidebarItemsList<Item, DraftId extends DraftSidebarItemId>({
    items,
    renderItem,
    parseDraftId,
    doesDraftBelongInList,
    convertDraftToItem,
}: SidebarItemsList.Props<Item, DraftId>): ReactElement {
    const { draft } = useSidebarContext();

    const draftItem = useMemo(() => {
        if (draft != null) {
            const parsedDraftId = parseDraftId(draft);
            if (parsedDraftId != null && doesDraftBelongInList(parsedDraftId)) {
                return convertDraftToItem(parsedDraftId);
            }
        }
        return undefined;
    }, [convertDraftToItem, doesDraftBelongInList, draft, parseDraftId]);

    // we put the items all in an array together, so that React gracefully
    // handles when an item turns from draft to persisted
    const packagesList = useMemo(() => {
        const elements = items.map((item) => renderItem(item));
        if (draftItem != null) {
            elements.push(renderItem(draftItem));
        }
        return elements;
    }, [draftItem, items, renderItem]);

    return <>{packagesList}</>;
}
