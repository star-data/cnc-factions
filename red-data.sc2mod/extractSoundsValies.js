const fs = require('fs');
const path = require('path');
const directoryToSearch = '/Applications/StarCraft II/Mods/command-and-conquer/red-data.sc2mod';

const outputFilePath = '/Applications/StarCraft II/Mods/command-and-conquer/red-data.sc2mod/pairs-sounds.txt';

// Function to recursively get all files
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            // Optionally filter by extension, e.g., .xml
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

// Main processing function
function processFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');

    // Regex to find all <CActorUnit ...> ... </CActorUnit>
    const actorRegex = /<CActorUnit[^>]*?id="([^"]+)"[^>]*?>([\s\S]*?)<\/CActorUnit>/gi;

    let match;
    while ((match = actorRegex.exec(data)) !== null) {
        const actorID = match[1];
        const actorContent = match[2];

        // Regex to find all <SoundArray ... /> inside this actor
        const soundArrayRegex = /<SoundArray\s+[^>]*?index="([^"]+)"\s+[^>]*?value="([^"]+)"\s*\/>/gi;

        let saMatch;
        while ((saMatch = soundArrayRegex.exec(actorContent)) !== null) {
            const soundIndex = saMatch[1];
            const soundValue = saMatch[2];

            // Append to output file
            fs.appendFileSync(outputFilePath, `${actorID} ${soundIndex} ${soundValue}\n`);
        }
    }
}

// Run the script
(function main() {
    // Clear output file before starting
    fs.writeFileSync(outputFilePath, '');

    const allFiles = getAllFiles(directoryToSearch);

    for (const file of allFiles) {
        processFile(file);
    }

    console.log(`Extraction complete. Results saved in ${outputFilePath}`);
})();