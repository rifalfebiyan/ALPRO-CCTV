const fs = require('fs');
let code = fs.readFileSync('components.tsx', 'utf8');

const fields = [
    { label: 'PIC', id: 'pic' },
    { label: 'Serial Number', id: 'sn' },
    { label: 'Urgency Point', id: 'urgency' },
    { label: 'Region', id: 'region' },
    { label: 'Check Date', id: 'date' },
    { label: 'Warranty Status', id: 'warranty' },
    { label: 'Distance to HO', id: 'distance' },
    { label: 'Problem Channel', id: 'prob_channel' },
    { label: 'Device to Replace', id: 'device' },
    { label: 'Device Qty', id: 'qty' },
    { label: 'Problem Detail', id: 'prob_detail' },
    { label: 'Result / Note', id: 'result' },
    { label: 'Result', id: 'result' },
    { label: 'Status', id: 'status' }
];

fields.forEach(f => {
    const rx = new RegExp('(\\s*<div[^>]*>\\s*<Label>' + f.label + '</Label>[\\s\\S]*?</div>)', 'g');
    code = code.replace(rx, `\n                        {!isDeleted('${f.id}') && ($1\n                        )}`);
});

const checks = [
    { name: 'shrinkage', id: 'shrinkage' },
    { name: 'alarm', id: 'alarm' },
    { name: 'onsite_damage', id: 'onsite' },
    { name: 'non_tech_damage', id: 'nontech' }
];

checks.forEach(c => {
    const rx = new RegExp('(\\s*<label[^>]*>[\\s\\S]*?name="' + c.name + '"[\\s\\S]*?</label>)', 'g');
    code = code.replace(rx, `\n                            {!isDeleted('${c.id}') && ($1\n                            )}`);
});

fs.writeFileSync('components.tsx', code);
console.log('Script ok');
