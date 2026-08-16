import { world, Entity, ItemStack } from "@minecraft/server";

export const ADDON_ID: string = "intentional_pickup";
export const WHITELIST_ID: string = `${ADDON_ID}:whitelist`;
export const BLACKLIST_ID: string = `${ADDON_ID}:blacklist`;

const PLAYER_DROPPED_ITEM_MARKER: string = `${ADDON_ID}:player_dropped_item`;

world.afterEvents.entityItemDrop.subscribe((event) => {
    // Ignore non-players
    if (event.entity.typeId !== "minecraft:player") return;

    for (let i = 0; i < event.items.length; i++) {
        let item: Entity = event.items[i] as Entity;

        try {
            item.addTag(PLAYER_DROPPED_ITEM_MARKER);
        } catch {}
    }
});

world.beforeEvents.entityItemPickup.subscribe((event) => {
    const WHITELIST: Array<string> = JSON.parse(world.getDynamicProperty(WHITELIST_ID) as string);
    const BLACKLIST: Array<string> = JSON.parse(world.getDynamicProperty(BLACKLIST_ID) as string);

    const hasWhitelist: boolean = WHITELIST.length > 0;
    const hasBlacklist: boolean = BLACKLIST.length > 0;
    const item: ItemStack = event.item.getComponent("minecraft:item")?.itemStack as ItemStack;

    // Ignore players
    if (event.entity.typeId === "minecraft:player") return;

    if ((hasWhitelist && !WHITELIST.includes(item.typeId)) || (hasBlacklist && BLACKLIST.includes(item.typeId))) {
        event.cancel = true;
    }

    if (!event.item.hasTag(PLAYER_DROPPED_ITEM_MARKER)) {
        event.cancel = true;
    }
});