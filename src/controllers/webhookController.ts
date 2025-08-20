import { Request, Response } from "express";
import prisma from "../models/prisma";

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body;

    // Handle user creation webhook
    if (body) {
      try {
        await handleUserCreation(body);
      } catch (error: any) {
        console.error("Failed to process user creation:", error);
        res.status(400).json({
          error: "Failed to process user data",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // Send acknowledgment response
    res.status(200).json({
      success: true,
      message: "User processed successfully",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Failed to process webhook",
      timestamp: new Date().toISOString(),
    });
  }
};

// Handle user creation from auth webhook
const handleUserCreation = async (userData: any) => {
  try {
    console.log("Received user data:", userData);

    // Extract and validate required fields
    const {
      userId,
      email,
      username,
      firstName,
      lastName,
      fullName,
      avatarUrl,
      phone,
      provider,
      providerId,
      emailVerified,
      phoneVerified,
      isActive = true,
      createdAt,
      updatedAt,
    } = userData;

    if (!userId || !email || !username) {
      throw new Error("Missing required fields: userId, email, or username");
    }

    // Prepare user data with proper defaults
    const userPayload = {
      userId,
      email,
      username,
      firstName: firstName || null,
      lastName: lastName || null,
      fullName: fullName || null,
      avatarUrl: avatarUrl || null,
      phone: phone || null,
      provider: provider || null,
      providerId: providerId || null,
      emailVerified: Boolean(emailVerified),
      phoneVerified: Boolean(phoneVerified),
      isActive: Boolean(isActive),
      createdAt: createdAt,
      updatedAt: updatedAt,
    };

    const user = await prisma.user.upsert({
      where: {
        userId: userPayload.userId,
      },
      update: {
        email: userPayload.email,
        username: userPayload.username,
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
        fullName: userPayload.fullName,
        avatarUrl: userPayload.avatarUrl,
        phone: userPayload.phone,
        provider: userPayload.provider,
        providerId: userPayload.providerId,
        emailVerified: userPayload.emailVerified,
        phoneVerified: userPayload.phoneVerified,
        isActive: userPayload.isActive,
        updatedAt: userPayload.updatedAt,
      },
      create: userPayload,
    });

    console.log(`User ${user.id} processed successfully (${user.email})`);
    return user;
  } catch (error) {
    console.error("Error processing user creation:", error);
    throw error;
  }
};

// Handle different HTTP methods for webhooks
export const handleWebhookPost = handleWebhook;
export const handleWebhookPut = handleWebhook;
export const handleWebhookPatch = handleWebhook;
export const handleWebhookGet = handleWebhook;
export const handleWebhookDelete = handleWebhook;
