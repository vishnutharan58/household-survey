const fs = require('fs');
let script = fs.readFileSync('scripts/generateMapping.js', 'utf8');
script = script.substring(0, script.lastIndexOf('}')) + '}\n`;\n\nfs.writeFileSync(\'packages/shared/src/utils/exportToExcel.ts\', code);\nconsole.log(\'Successfully wrote exportToExcel.ts\');\n';
fs.writeFileSync('scripts/generateMapping.js', script);
