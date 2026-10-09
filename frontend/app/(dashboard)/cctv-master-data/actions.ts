"use server"

import { createClient } from "@/lib/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

async function logAuditAction(actionType: string, targetTable: string, targetId: string | null, oldData: any, newData: any) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const token = cookieStore.get('alpro_token')?.value;

    let actorId = null;
    let actorName = 'System';

    if (token) {
        const payload = await verifyToken(token) as any;
        if (payload) {
            actorId = payload.id;
            actorName = payload.name;
        }
    }

    try {
        await supabase.from('audit_logs').insert({
            actor_id: actorId,
            actor_name: actorName,
            action_type: actionType,
            target_table: targetTable,
            target_id: targetId,
            old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
            new_data: newData ? JSON.parse(JSON.stringify(newData)) : null
        });
    } catch (e) {
        console.error("Failed to log audit action:", e);
    }
}

export async function addCctvData(formData: FormData) {
    const supabase = await createClient();

    const data = {
        outlet_name: formData.get("outlet_name") as string,
        pic: formData.get("pic") as string,
        serial_number: formData.get("serial_number") as string,
        urgency_point: formData.get("urgency_point") as string,
        region: formData.get("region") as string,
        check_date: formData.get("check_date") as string,
        warranty_status: formData.get("warranty_status") as string,
        distance_to_ho: formData.get("distance_to_ho") as string,
        shrinkage: formData.get("shrinkage") === "on",
        alarm: formData.get("alarm") === "on",
        onsite_damage: formData.get("onsite_damage") === "on",
        non_tech_damage: formData.get("non_tech_damage") === "on",
        problem_channel: formData.get("problem_channel") as string,
        problem_detail: formData.get("problem_detail") as string,
        device_to_replace: formData.get("device_to_replace") as string,
        device_qty: parseInt(formData.get("device_qty") as string) || 0,
        result: formData.get("result") as string,
        status: formData.get("status") as string || "Active",
        dynamic_fields: {} as Record<string, string>
    };

    for (const [key, value] of formData.entries()) {
        if (key.startsWith("custom_")) {
            data.dynamic_fields[key.replace("custom_", "")] = value.toString();
        }
    }

    const { error, data: insertedData } = await supabase.from("cctv_master_data").insert(data).select().single();
    if (error) {
        console.error("Error inserting data:", error);
        throw new Error(error.message);
    }

    await logAuditAction("ADD", "cctv_master_data", insertedData?.id || null, null, data);

    revalidatePath("/cctv-master-data", "layout");
}

export async function editCctvData(id: string, formData: FormData) {
    const supabase = await createClient();

    const data = {
        outlet_name: formData.get("outlet_name") as string,
        pic: formData.get("pic") as string,
        serial_number: formData.get("serial_number") as string,
        urgency_point: formData.get("urgency_point") as string,
        region: formData.get("region") as string,
        check_date: formData.get("check_date") as string,
        warranty_status: formData.get("warranty_status") as string,
        distance_to_ho: formData.get("distance_to_ho") as string,
        shrinkage: formData.get("shrinkage") === "on",
        alarm: formData.get("alarm") === "on",
        onsite_damage: formData.get("onsite_damage") === "on",
        non_tech_damage: formData.get("non_tech_damage") === "on",
        problem_channel: formData.get("problem_channel") as string,
        problem_detail: formData.get("problem_detail") as string,
        device_to_replace: formData.get("device_to_replace") as string,
        device_qty: parseInt(formData.get("device_qty") as string) || 0,
        result: formData.get("result") as string,
        status: formData.get("status") as string || "Normal",
        updated_at: new Date().toISOString(),
        dynamic_fields: {} as Record<string, string>
    };

    for (const [key, value] of formData.entries()) {
        if (key.startsWith("custom_")) {
            data.dynamic_fields[key.replace("custom_", "")] = value.toString();
        }
    }

    // Ambil data lama untuk audit trail
    const { data: oldData } = await supabase.from("cctv_master_data").select("*").eq("id", id).single();

    const { error } = await supabase.from("cctv_master_data").update(data).eq("id", id);
    if (error) {
        throw new Error(error.message);
    }

    await logAuditAction("EDIT", "cctv_master_data", id, oldData, data);

    revalidatePath("/cctv-master-data", "layout");
}

export async function deleteCctvData(id: string) {
    const supabase = await createClient();
    const { data: oldData } = await supabase.from("cctv_master_data").select("*").eq("id", id).single();

    const { error } = await supabase.from("cctv_master_data").delete().eq("id", id);
    if (error) {
        throw new Error(error.message);
    }

    await logAuditAction("DELETE", "cctv_master_data", id, oldData, null);

    revalidatePath("/cctv-master-data", "layout");
}

export async function bulkDeleteCctv(ids: string[]) {
    if (!ids || ids.length === 0) return;
    const supabase = await createClient();

    // Fetch old data for audit trail BEFORE delete
    const { data: oldRows } = await supabase.from("cctv_master_data").select("*").in("id", ids);

    const { error } = await supabase.from("cctv_master_data").delete().in("id", ids);
    if (error) {
        throw new Error(error.message);
    }

    // Log individually so audit trail matches perfectly
    if (oldRows) {
        for (const old of oldRows) {
            await logAuditAction("DELETE", "cctv_master_data", old.id, old, null);
        }
    }

    revalidatePath("/cctv-master-data", "layout");
}

export async function bulkUpdateCctvStatus(ids: string[], newStatus: string) {
    if (!ids || ids.length === 0 || !newStatus) return;
    const supabase = await createClient();

    // Fetch old data for audit trail BEFORE update
    const { data: oldRows } = await supabase.from("cctv_master_data").select("*").in("id", ids);

    const { error } = await supabase.from("cctv_master_data").update({ status: newStatus, updated_at: new Date().toISOString() }).in("id", ids);
    if (error) {
        throw new Error(error.message);
    }

    // Note: We don't fetch newData to save roundtrips on bulk operations. 
    // We just reconstruct what the new data looks like using the old row + new status.
    if (oldRows) {
        for (const old of oldRows) {
            const simulatedNewData = { ...old, status: newStatus, updated_at: new Date().toISOString() };
            await logAuditAction("EDIT", "cctv_master_data", old.id, old, simulatedNewData);
        }
    }

    revalidatePath("/cctv-master-data", "layout");
}

export async function addCustomColumn(label: string) {
    const supabase = await createClient();
    const column_key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const { error } = await supabase.from("cctv_custom_columns").insert({
        column_key,
        column_label: label
    });
    if (error) throw new Error(error.message);
    revalidatePath("/cctv-master-data", "layout");
}

export async function editCustomColumn(id: string, label: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("cctv_custom_columns").update({
        column_label: label
    }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/cctv-master-data", "layout");
}

export async function deleteCustomColumn(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("cctv_custom_columns").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/cctv-master-data", "layout");
}

export async function deleteStandardColumn(columnKey: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("cctv_custom_columns").insert({
        column_key: columnKey,
        column_label: "DELETED_STANDARD"
    })

    if (error) {
        console.error("Error soft deleting standard column:", error)
        throw new Error("Failed to delete column")
    }

    revalidatePath("/cctv-master-data")
}

export async function bulkImportCctvData(rawRows: any[]) {
    if (!rawRows || rawRows.length === 0) return { count: 0 };
    const supabase = await createClient();

    // Map Excel "human" keys to Database "schema" keys
    const formattedData = rawRows.map(r => ({
        outlet_name: r["Outlet Name"] || "-",
        pic: r["PIC"] || "-",
        serial_number: r["Serial Number"] || "-",
        urgency_point: Number(r["Urgency Point"]) || 0,
        region: r["Region"] || "-",
        check_date: r["Check Date"] || "-",
        warranty_status: r["Warranty"] || "-",
        distance_to_ho: r["Distance to HO"] || "-",
        shrinkage: r["Shrinkage"] === "YES",
        alarm: r["Alarm"] === "YES",
        onsite_damage: r["Onsite Damage"] === "YES",
        non_tech_damage: r["Non-Tech Damage"] === "YES",
        problem_channel: r["Problem Channel"] || "-",
        problem_detail: r["Problem Detail"] || "-",
        device_to_replace: r["Device To Replace"] || "-",
        device_qty: Number(r["Device Qty"]) || 0,
        result: r["Result"] || "-",
        status: r["Status"] || "Normal",
        // Extract any custom string keys
        dynamic_fields: Object.keys(r)
            .filter(k => k.startsWith("Custom - "))
            .reduce((acc, key) => {
                const pureKey = key.replace("Custom - ", "").toLowerCase().replace(/[^a-z0-9]+/g, '_');
                acc[pureKey] = String(r[key] || "");
                return acc;
            }, {} as Record<string, string>)
    }));

    // Batch insert
    const { data: insertedData, error } = await supabase.from("cctv_master_data").insert(formattedData).select();

    if (error) {
        throw new Error(error.message);
    }

    // Log individually so audit trail resolves beautifully
    if (insertedData) {
        for (const row of insertedData) {
            await logAuditAction("ADD", "cctv_master_data", row.id, null, row);
        }
    }

    revalidatePath("/cctv-master-data", "layout");
    return { count: insertedData?.length || 0 };
}
