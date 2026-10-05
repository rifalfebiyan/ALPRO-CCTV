export function parseCSV(text: string): string[][] {
    const result: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                // Escaped quote
                cell += '"';
                i++;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of cell
            row.push(cell.trim());
            cell = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            // End of row
            if (char === '\r' && text[i + 1] === '\n') {
                i++; // skip \n in \r\n
            }
            row.push(cell.trim());
            result.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }

    // push remaining
    if (cell || row.length > 0) {
        row.push(cell.trim());
        result.push(row);
    }

    // Filter out empty rows
    return result.filter(r => r.some(c => c.length > 0));
}
