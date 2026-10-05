import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load ENV since we are in ES Module standard Node
const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_SERVICE_ROLE_KEY = envVars["SUPABASE_SERVICE_ROLE_KEY"] || envVars["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseCSV(text) {
    const result = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (char === ',' && !inQuotes) {
            row.push(cell.trim()); cell = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && text[i + 1] === '\n') { i++; }
            row.push(cell.trim());
            result.push(row); row = []; cell = '';
        } else { cell += char; }
    }
    if (cell || row.length > 0) { row.push(cell.trim()); result.push(row); }
    return result.filter(r => r.some(c => c.length > 0));
}

async function runMigration() {
    console.log("Fetching Google Sheets data...");
    const url = "https://docs.google.com/spreadsheets/d/1nfdY3Ec3BSae114w6Ed-Tkp4plY23dcVEGU1XSifd74/export?format=csv&gid=1518168928";

    try {
        const res = await fetch(url);
        const text = await res.text();
        const data = parseCSV(text);

        if (data.length <= 1) {
            console.log("No data found.");
            return;
        }

        const allRows = data.slice(1);

        console.log(`Pulls ${allRows.length} rows... Migrating to Supabase!`);

        // Process in batches of 50 to avoid any Supabase limits on large inserts
        const batchSize = 50;
        let inserted = 0;

        for (let i = 0; i < allRows.length; i += batchSize) {
            const batch = allRows.slice(i, i + batchSize).map(row => ({
                outlet_name: row[0] || "",
                pic: row[1] || "",
                serial_number: row[2] || "",
                urgency_point: row[3] || "",
                region: row[4] || "",
                check_date: row[5] || "",
                warranty_status: row[6] || "",
                distance_to_ho: row[7] || "",
                shrinkage: row[8] === "TRUE",
                alarm: row[9] === "TRUE",
                onsite_damage: row[10] === "TRUE",
                non_tech_damage: row[12] === "TRUE",
                problem_channel: row[13] || "",
                problem_detail: row[14] || "",
                device_to_replace: row[15] || "",
                device_qty: parseInt(row[16]) || 0,
                result: row[17] || "",
                status: row[20] || "NOT YET"
            })).filter(item => item.outlet_name.trim() !== "");

            const { error } = await supabase.from("cctv_master_data").insert(batch);
            if (error) {
                console.error("Batch insert failed:", error);
            } else {
                inserted += batch.length;
                console.log(`Inserted ${inserted} / ${allRows.length}`);
            }
        }

        console.log("MIGRATION COMPLETE!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

runMigration();
