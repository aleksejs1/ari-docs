const fs = require('fs');
const path = require('path');

// Adjusted path to look into the 'docs' subdirectory from 'scripts'
// d:/code/m/ari-docs/docs/scripts/patch_openapi.js -> ../docs/specs/openapi.json
const filePath = path.join(__dirname, '..', 'docs', 'specs', 'openapi.json');

console.log(`Looking for file at: ${filePath}`);

try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('File found. Patching...');

    // Replace "ref":"...", with nothing (if it's at start of object)
    content = content.replace(/"ref":"[^"]+",?/g, '');
    // Replace ,"ref":"..." with nothing (if it's later in object)
    content = content.replace(/,"ref":"[^"]+"/g, '');

    fs.writeFileSync(filePath, content);
    console.log('Successfully patched openapi.json');
} catch (err) {
    console.error('Error patching file:', err);
    process.exit(1);
}
