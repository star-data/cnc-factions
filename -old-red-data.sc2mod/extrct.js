const fs = require('fs');
const path = require('path');

// Function to recursively get all XML files in directory
function getXmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getXmlFiles(filePath));
        } else if (file.endsWith('.xml')) {
            results.push(filePath);
        }
    });
    return results;
}

// Function to process each file
function processFile(filePath, pairs) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/);
    const regex = /<CActorUnit\s+[^>]*id="([^"]+)"[^>]*unitName="([^"]+)"/i;

    lines.forEach(line => {
        const match = line.match(regex);
        if (match) {
            const id = match[1];
            const unitName = match[2];
            if(id!= unitName){
                pairs.push({ id, unitName });
            }
        }
    });
}

// Main execution
const outputFile = 'unit_pairs.txt';
const pairs = [];

const xmlFiles = getXmlFiles('.');

xmlFiles.forEach(file => {
    processFile(file, pairs);
});

// Save results to file
const outputData = pairs.map(p => `${p.id} ${p.unitName}`).join('\n');
fs.writeFileSync(outputFile, outputData, 'utf8');

console.log(`Extracted ${pairs.length} pairs. Saved to ${outputFile}`);