const fs = require('fs');
const path = require('path');

// Output file for pairs
const outputFile = 'actor_model_pairs.txt';

// Function to get all files recursively
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
    const files = getAllFiles('.');

    // Clear output file
    fs.writeFileSync(outputFile, '', 'utf8');

    // Regex to match <CActorUnit id="actorID"...>
    const cActorUnitRegex = /<CActorUnit\s+[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/CActorUnit>/gi;

    // Regex to find <Model value="model"/>
    const modelRegex = /<Model\s+value=["']([^"']+)["']\s*\/>/i;

    files.forEach(file => {
        if (path.extname(file).toLowerCase() === '.xml') {
            let content;
            try {
                content = fs.readFileSync(file, 'utf8');
            } catch (err) {
                // Skip unreadable files
                return;
            }

            let match;
            while ((match = cActorUnitRegex.exec(content)) !== null) {
                const actorID = match[1];
                const innerContent = match[2];

                const modelMatch = modelRegex.exec(innerContent);
                if (modelMatch) {
                    const modelValue = modelMatch[1];
                    // Save pair: actorID and modelValue
                    if(actorID !=modelValue){
                        fs.appendFileSync(outputFile, `${actorID} ${modelValue}\n`, 'utf8');
                        console.log(`Found pair in ${file}: ${actorID} ${modelValue}`);
                    }
                }
            }
        }
    });

    console.log(`Extraction complete. Pairs saved in ${outputFile}`);
}

main();