import axios from "axios";
import fetch from "node-fetch";

const API_KEY = "";
const BASE_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const COLLECTION_ADDRESS = "Gei2p3jnEA5GpZnVgPBZputFui3SWzk89NQ6MFEa3i3W"; // Sujiko Warriors
const WEBHOOK_URL = "";
const uniqueMints = new Set();

const getAssetsByGroup = async () => {
    let page = 1;
    let hasMoreResults = true;
  
    while (hasMoreResults) {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "my-id",
          method: "getAssetsByGroup",
          params: {
            groupKey: "collection",
            groupValue: COLLECTION_ADDRESS,
            page,
            limit: 1000,
          },
        }),
      });
  
      const result = await response.json();
  
      // Add each owner to the Set, automatically discarding duplicates
      (result as any).result.items.forEach((item: any) => uniqueMints.add(item.id));
  
      if ((result as any).result.items.length < 1000) {
        hasMoreResults = false;
      } else {
        page++;
      }
    }
  
    // Convert Set to Array for stringification
    const uniqueMintsArray = Array.from(uniqueMints)
  
    const root = {
      count: uniqueMints.size,
      mints: uniqueMintsArray,
    };
  
    return root;
};

(async () => {
  // fetch mints
  console.log("Fetching mints...");
  const mints = await getAssetsByGroup();
  console.log(`Found ${mints.count} mints!`);
    
  // create webhook
  console.log("Creating webhook...");
  const webhookUrl = `https://api.helius.xyz/v0/webhooks?api-key=${API_KEY}`;
  const webhookRes = await axios.post(webhookUrl, {
      webhookURL: WEBHOOK_URL,
      transactionTypes: ['NFT_SALE'],
      accountAddresses: mints.mints,
      webhookType: 'enhanced',
  });
  console.log(`Webhook created with ID: ${webhookRes.data.webhookID}`);
})();


