// backupRestore.ts
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

// 🔹 Backup Firestore data to JSON and download
export async function handleBackup() {
  try {
    const collections = ["medicines", "sales"]; // add more if needed
    const backupData: any = {};

    for (const col of collections) {
      const snap = await getDocs(collection(db, col));
      backupData[col] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          // Convert Firestore Timestamps to ISO for JSON (safe for restore)
          timestamp:
            data.timestamp && typeof data.timestamp.toDate === "function"
              ? data.timestamp.toDate().toISOString()
              : data.timestamp,
        };
      });
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ Backup completed successfully!");
  } catch (err) {
    console.error("Backup error:", err);
    alert("❌ Backup failed. Check console.");
  }
}

// 🔹 Restore Firestore data from uploaded JSON (clears collections first)
export async function handleRestore(
  event: React.ChangeEvent<HTMLInputElement>
) {
  try {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const data = JSON.parse(text);

    for (const col in data) {
      const colRef = collection(db, col);

      // 1️⃣ Delete existing docs
      const snap = await getDocs(colRef);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, col, d.id));
      }

      // 2️⃣ Restore docs
      for (const item of data[col]) {
        const { id, ...rest } = item;

        // Convert timestamp back to Firestore Timestamp if this is sales collection
        if (col === "sales" && rest.timestamp) {
          rest.timestamp = Timestamp.fromDate(new Date(rest.timestamp));
        }

        await setDoc(doc(db, col, id), rest);
      }
    }

    alert("✅ Restore completed successfully!");
    event.target.value = ""; // reset input
  } catch (err) {
    console.error("Restore error:", err);
    alert("❌ Restore failed. Check console.");
  }
}
