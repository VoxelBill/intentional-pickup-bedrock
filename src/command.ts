import { world, system, CustomCommandParamType, CommandPermissionLevel, CustomCommandStatus, Player } from "@minecraft/server";
import { ADDON_ID, WHITELIST_ID, BLACKLIST_ID } from "./main.ts";

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerEnum(`${ADDON_ID}:subcommand`, ["add", "clear", "remove"]);

    customCommandRegistry.registerCommand(
        {
            name: `${ADDON_ID}:whitelist`,
            description: "Add, clear, or remove items to and from the whitelist.",
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: true,
            optionalParameters: [
                {
                    name: `${ADDON_ID}:subcommand`,
                    type: CustomCommandParamType.Enum
                },
                {
                    name: "itemName",
                    type: CustomCommandParamType.ItemType
                }
            ]
        },
        (origin, subcommand, item) => {
            let player: Player | undefined = undefined;
            if (origin.sourceEntity instanceof Player) {
                player = origin.sourceEntity as Player;
            }

            if (subcommand === undefined) {
                return whitelistList(player);
            }

            switch (subcommand) {
                case "add":
                    if (item === undefined) {
                        return {status: CustomCommandStatus.Failure, message: "Syntax error: Unexpected \"\": at \"/whitelist add >><<\""};
                    }
                    return whitelistAdd(item["id"]);
                case "clear":
                    if (item !== undefined) {
                        return {status: CustomCommandStatus.Failure, message: `Syntax error: Unexpected "${item}": at "/whitelist clear >>${item}<<"`};
                    }
                    return whitelistClear();
                case "remove":
                    if (item === undefined) {
                        return {status: CustomCommandStatus.Failure, message: "Syntax error: Unexpected \"\": at \"/whitelist remove >><<\""};
                    }
                    return whitelistRemove(item["id"]);
                default:
                    let trailingText: string = item !== undefined ? ` ${item["id"]}` : "";
                    return {status: CustomCommandStatus.Failure, message: `Syntax error: Unexpected "${subcommand}": at "/whitelist >>${subcommand}<<${trailingText}"`};
            }
        }
    );

    customCommandRegistry.registerCommand(
        {
            name: `${ADDON_ID}:blacklist`,
            description: "Add, clear, or remove items to and from the blacklist.",
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: true,
            optionalParameters: [
                {
                    name: `${ADDON_ID}:subcommand`,
                    type: CustomCommandParamType.Enum
                },
                {
                    name: "itemName",
                    type: CustomCommandParamType.ItemType
                }
            ]
        },
        (origin, subcommand, item) => {
            let player: Player | undefined = undefined;
            if (origin.sourceEntity instanceof Player) {
                player = origin.sourceEntity as Player;
            }

            if (subcommand === undefined) {
                return blacklistList(player);
            }

            switch (subcommand) {
                case "add":
                    if (item === undefined) {
                        return {status: CustomCommandStatus.Failure, message: "Syntax error: Unexpected \"\": at \"/blacklist add >><<\""};
                    }
                    return blacklistAdd(item["id"]);
                case "clear":
                    if (item !== undefined) {
                        return {status: CustomCommandStatus.Failure, message: `Syntax error: Unexpected "${item}": at "/blacklist clear >>${item}<<"`};
                    }
                    return blacklistClear();
                case "remove":
                    if (item === undefined) {
                        return {status: CustomCommandStatus.Failure, message: "Syntax error: Unexpected \"\": at \"/blacklist remove >><<\""};
                    }
                    return blacklistRemove(item["id"]);
                default:
                    let trailingText: string = item !== undefined ? ` ${item["id"]}` : "";
                    return {status: CustomCommandStatus.Failure, message: `Syntax error: Unexpected "${subcommand}": at "/blacklist >>${subcommand}<<${trailingText}"`};
            }
        }
    );
});

world.afterEvents.worldLoad.subscribe(() => {
    if (world.getDynamicProperty(WHITELIST_ID) === undefined) {
        world.setDynamicProperty(WHITELIST_ID, JSON.stringify([]));
    }

    if (world.getDynamicProperty(BLACKLIST_ID) === undefined) {
        world.setDynamicProperty(BLACKLIST_ID, JSON.stringify([]));
    }
});

//////////////////////////
/// WHITELIST COMMANDS ///
//////////////////////////

// Lists all items in the whitelist
function whitelistList(player: Player | undefined) {
    let whitelist: Array<string> = JSON.parse(world.getDynamicProperty(WHITELIST_ID) as string);
    player?.sendMessage(`Whitelist contains [${whitelist.length} items]:`);

    for (let item of whitelist) {
        player?.sendMessage(item);
    }

    return {status: CustomCommandStatus.Success};
}

// Adds given item to the whitelist
function whitelistAdd(item: string) {
    let whitelist_str: string = world.getDynamicProperty(WHITELIST_ID) as string;
    let whitelist: Array<string> = JSON.parse(whitelist_str);

    if (whitelist.includes(item)) {
        return {
            status: CustomCommandStatus.Failure,
            message: `Failed to add '${item}' to the whitelist. Item already exists in the whitelist.`
        };
    }

    // Check if adding the item id plus the qoutes and comma will be over the string limit.
    if (whitelist_str.length + item.length + 3 > 32_767) {
        return {status: CustomCommandStatus.Failure, message: `Failed to add '${item}' to the whitelist. Whitelist is full!`};
    }

    whitelist.push(item);
    world.setDynamicProperty(WHITELIST_ID, JSON.stringify(whitelist));

    return {status: CustomCommandStatus.Success, message: `Successfully added '${item}' to the whitelist.`};
}

// Clears the whitelist
function whitelistClear() {
    world.setDynamicProperty(WHITELIST_ID, JSON.stringify([]));
    return {status: CustomCommandStatus.Success, message: "Successfully cleared the whitelist."};
}

// Removes given item from the whitelist
function whitelistRemove(item: string) {
    let whitelist: Array<string> = JSON.parse(world.getDynamicProperty(WHITELIST_ID) as string);

    if (!whitelist.includes(item)) {
        return {
            status: CustomCommandStatus.Failure,
            message: `Failed to remove '${item}' from the whitelist. Item was not found in the whitelist.`
        };
    }

    whitelist = whitelist.filter(i => i !== item);
    world.setDynamicProperty(WHITELIST_ID, JSON.stringify(whitelist));

    return {status: CustomCommandStatus.Success, message: `Successfully removed '${item}' from the whitelist.`};
}

//////////////////////////
/// BLACKLIST COMMANDS ///
//////////////////////////

// Lists all items in the blacklist
function blacklistList(player: Player | undefined) {
    let blacklist: Array<string> = JSON.parse(world.getDynamicProperty(BLACKLIST_ID) as string);
    player?.sendMessage(`Blacklist contains [${blacklist.length} items]:`);

    for (let item of blacklist) {
        player?.sendMessage(item);
    }

    return {status: CustomCommandStatus.Success};
}

// Adds given item to the blacklist
function blacklistAdd(item: string) {
    let blacklist_str: string = world.getDynamicProperty(BLACKLIST_ID) as string;
    let blacklist: Array<string> = JSON.parse(blacklist_str);

    if (blacklist.includes(item)) {
        return {
            status: CustomCommandStatus.Failure,
            message: `Failed to add '${item}' to the blacklist. Item already exists in the blacklist.`
        };
    }

    // Check if adding the item id plus the qoutes and comma will be over the string limit.
    if (blacklist_str.length + item.length + 3 > 32_767) {
        return {status: CustomCommandStatus.Failure, message: `Failed to add '${item}' to the blacklist. Blacklist is full!`};
    }

    blacklist.push(item);
    world.setDynamicProperty(BLACKLIST_ID, JSON.stringify(blacklist));

    return {status: CustomCommandStatus.Success, message: `Successfully added '${item}' to the blacklist.`};
}

// Clears the blacklist
function blacklistClear() {
    world.setDynamicProperty(BLACKLIST_ID, JSON.stringify([]));
    return {status: CustomCommandStatus.Success, message: "Successfully cleared the blacklist."};
}

// Removes given item from the blacklist
function blacklistRemove(item: string) {
    let blacklist: Array<string> = JSON.parse(world.getDynamicProperty(BLACKLIST_ID) as string);

    if (!blacklist.includes(item)) {
        return {
            status: CustomCommandStatus.Failure,
            message: `Failed to remove '${item}' from the blacklist. Item was not found in the blacklist.`
        };
    }

    blacklist = blacklist.filter(i => i !== item);
    world.setDynamicProperty(BLACKLIST_ID, JSON.stringify(blacklist));

    return {status: CustomCommandStatus.Success, message: `Successfully removed '${item}' from the blacklist.`};
}