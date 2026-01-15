
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

async function testConnection() {
    const uri = process.env.MONGODB_URI;
    console.log("Testing connection to:", uri?.split("@")[1]); // Log safe part of URI

    if (!uri) {
        console.error("No MONGODB_URI found");
        return;
    }

    // Test 1: Standard Connection
    console.log("\n--- Attempt 1: Standard Connection ---");
    try {
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
        console.log("✅ SUCCESS: Standard connection established!");
        await client.close();
    } catch (e: any) {
        console.error("❌ FAILED: Standard connection.", e.message);
    }

    // Test 2: Connection with family: 4 (IPv4)
    console.log("\n--- Attempt 2: IPv4 Forced (family: 4) ---");
    try {
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
        await client.connect();
        console.log("✅ SUCCESS: IPv4 connection established!");
        await client.close();
    } catch (e: any) {
        console.error("❌ FAILED: IPv4 connection.", e.message);
    }
}

testConnection();
