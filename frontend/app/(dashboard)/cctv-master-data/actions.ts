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

    revalidatePath("/cctv-master-data");
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

    revalidatePath("/cctv-master-data");
}

export async function deleteCctvData(id: string) {
    const supabase = await createClient();
    const { data: oldData } = await supabase.from("cctv_master_data").select("*").eq("id", id).single();

    const { error } = await supabase.from("cctv_master_data").delete().eq("id", id);
    if (error) {
        throw new Error(error.message);
    }

    await logAuditAction("DELETE", "cctv_master_data", id, oldData, null);

    revalidatePath("/cctv-master-data");
}

export async function addCustomColumn(label: string) {
    const supabase = await createClient();
    const column_key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const { error } = await supabase.from("cctv_custom_columns").insert({
        column_key,
        column_label: label
    });
    if (error) throw new Error(error.message);
    revalidatePath("/cctv-master-data");
}

export async function editCustomColumn(id: string, label: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("cctv_custom_columns").update({
        column_label: label
    }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/cctv-master-data");
}

export async function deleteCustomColumn(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("cctv_custom_columns").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/cctv-master-data");
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
