import { Request, Response } from "express";

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const headers = req.headers;
    const body = req.body;
    const query = req.query;

    // Log the complete webhook payload
    console.log("=== WEBHOOK RECEIVED ===");
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log(`Headers:`, JSON.stringify(headers, null, 2));
    console.log(`Query Parameters:`, JSON.stringify(query, null, 2));
    console.log(`Body:`, JSON.stringify(body, null, 2));
    console.log("========================");

    // Send acknowledgment response
    res.status(200).json({
      message: "Webhook received successfully",
      timestamp,
      received: {
        method,
        url,
        bodySize: JSON.stringify(body).length,
        hasHeaders: Object.keys(headers).length > 0,
        hasQuery: Object.keys(query).length > 0,
      },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Failed to process webhook",
      timestamp: new Date().toISOString(),
    });
  }
};

// Handle different HTTP methods for webhooks
export const handleWebhookPost = handleWebhook;
export const handleWebhookPut = handleWebhook;
export const handleWebhookPatch = handleWebhook;
export const handleWebhookGet = handleWebhook;
export const handleWebhookDelete = handleWebhook;
