const fs = require('fs');
const path = require('path');

// Path to the pairs file
const pairsFile = '/Applications/StarCraft II/Mods/command-and-conquer/red-data.sc2mod/pairs-sounds.txt';

// Read and parse the pairs file
function readPairs(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');
    const pairs = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
            return { actorID: parts[0], unitID: parts[1] };
        }
        return null;
    }).filter(p => p !== null);
    return pairs;
}

// Recursively get all files in directory
function getAllFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

// Main function
function main() {
    const pairs = readPairs(pairsFile);
    if (pairs.length === 0) {
        console.log('No pairs found in the pairs file.');
        return;
    }

    const allFiles = getAllFiles('/Applications/StarCraft II/Mods/command-and-conquer/red-data.sc2mod/');

    allFiles.forEach(file => {
        // Read file content
        let content;
        try {
            content = fs.readFileSync(file, 'utf8');
        } catch (err) {
            // Skip binary or unreadable files
            return;
        }

        let originalContent = content;

        // For each pair, replace <actorID> with <unitID>actor
        pairs.forEach(({ actorID, unitID }) => {
            // Replace all occurrences of <actorID>
            // Using regex to match exact tag or attribute
            const regex = new RegExp(`([ ">\\\/=])${actorID}([ "<\\\/=])`, 'g');
            content = content.replace(regex, `$1${unitID}$2`);
        });

        // Write back only if changes occurred
        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated file: ${file}`);
        }
    });

    console.log('Replacement complete.');
}

main();