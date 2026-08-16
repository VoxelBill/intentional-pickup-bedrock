import fs from "fs";
import { ZipArchive } from "archiver";

////////////////////////
/// Script Variables ///
////////////////////////

const SOURCE_URL = "https://github.com/VoxelBill/intentional-pickup-bedrock";
const ADDON_ID = "intentional_pickup";
const ADDON_VERSION = "1.0.0";
const MINECRAFT_VERSION = "26.40";

///////////////////////////
/// Command Line Parser ///
///////////////////////////

const args = process.argv.slice(2);

const commands = {
    build,
    clean
};

for (let i = 0; i < args.length; i++) {
    let command = args[i];
    if (commands[command]) {
        commands[command]();
    } else {
        console.log(`Unknown command: ${command}`);
    }

    if (i < args.length - 1) {
        console.log("");
    }
}

/////////////////////////////
/// Build Script Commands ///
/////////////////////////////

function build() {
    // Create build directory
    if (!fs.existsSync("build")) {
        fs.mkdirSync("build");
    }

    // Create archive
    const output = fs.createWriteStream(`build/${ADDON_ID}-bedrock-${ADDON_VERSION}+mc${MINECRAFT_VERSION}.mcaddon`);
    console.log("[INFO] Creating archive...");
    const archive = new ZipArchive({
        zlib: { level: 9 }
    });

    output.on("close", function() {
        console.log("[SUCCESS] Build complete!");
    });

    archive.on("error", function(err) {
        fs.rmSync("build", { recursive: true, force: true });
        throw err + "\n[FAILURE] Build failed!";
    });

    archive.pipe(output);

    // Add files
    console.log("[INFO] Adding directory 'scripts' to archive...");
    archive.directory("scripts/", "scripts/");
    console.log("[INFO] Directory 'scripts' added to archive successfully!");

    for (let file of ["manifest.json","pack_icon.png","LICENSE","README.md"]) {
        console.log(`[INFO] Adding file '${file}' to archive...`);
        archive.file(file, { name: file });
        console.log(`[INFO] File '${file}' added to archive successfully!`);
    }

    let file = "SOURCE.txt";
    console.log(`[INFO] Adding file '${file}' to archive...`);
    fs.writeFileSync(
        file,
`SOURCE CODE NOTICE

This is an open-source Minecraft addon licensed under the MIT license.

Full source code: ${SOURCE_URL}

Please do not delete this file.

Anyone who redistributes this addon (original or modified) must keep this file and its accompanying LICENSE file included.
`
    );
    archive.file(file, { name: file });
    setTimeout(() => {
        fs.rmSync(file);
    }, 500);
    console.log(`[INFO] File '${file}' added to archive successfully!`);

    // Finalize archive
    archive.finalize();
    console.log("[INFO] Archive created successfully!");
}

function clean() {
    console.log("[INFO] Cleaning build directory...");
    fs.rmSync("build", { recursive: true, force: true });
    console.log("[SUCCESS] Clean complete!");
}
