import fs from "fs";
import path from "path";

const LIST_FILE = "./textures.txt";
const SOURCE_DIR = "./textures";
const DEST_DIR = "./textures2";

// читаем список текстур
const lines = fs.readFileSync(LIST_FILE, "utf8")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

for (const relPath of lines) {
    // берём только часть после "Assets/Textures/"
    const textureName = relPath.replace(/^.*?Assets[\/\\]Textures[\/\\]/, "");
    const src = path.join(SOURCE_DIR, textureName);
    const dest = path.join(DEST_DIR, textureName);

    try {
        if (fs.existsSync(src)) {
            // создаём директорию, если её нет
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.renameSync(src, dest); // перемещаем файл
            console.log(`✅ moved: ${textureName}`);
        } else {
            console.warn(`⚠️ not found: ${textureName}`);
        }
    } catch (err) {
        console.error(`❌ error moving ${textureName}:`, err.message);
    }
}

console.log("✨ Done!");
