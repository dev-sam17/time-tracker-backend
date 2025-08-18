import { Request, Response } from "express";
import prisma from "../models/prisma";

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Log the complete webhook payload
    console.log("=== WEBHOOK RECEIVED ===");
    console.log({ user: body?.user });

    // Handle user creation webhook from Supabase auth
    if (body?.metadata?.name === "before-user-created" && body?.user) {
      await handleUserCreation(body.user);
    }

    // Send acknowledgment response
    res.status(204).json({});
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
    const { id, email, phone, app_metadata, user_metadata } = userData;

    // Extract user information
    const fullName = user_metadata?.full_name || user_metadata?.name || "";
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ") || null;

    // Generate username from email or use auth ID
    const username =
      email?.split("@")[0] || id?.substring(0, 8) || `user_${Date.now()}`;

    console.log(`Creating user in database: ${email}`);

    // Check if user already exists by email or authId
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { id }],
      },
    });

    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return;
    }

    // Create user in database with all available fields
    const newUser = await prisma.user.create({
      data: {
        userId: id,
        email,
        username,
        firstName: firstName || null,
        lastName,
        fullName,
        avatarUrl: user_metadata?.avatar_url || user_metadata?.picture || null,
        phone: phone || null,
        provider: app_metadata?.provider || null,
        providerId: user_metadata?.provider_id || user_metadata?.sub || null,
        emailVerified: user_metadata?.email_verified || false,
        phoneVerified: user_metadata?.phone_verified || false,
        isActive: true,
      },
    });

    console.log(
      `User created successfully: ID=${newUser.id}, Email=${newUser.email}, AuthID=${newUser.userId}`
    );
    console.log("========================");
  } catch (error) {
    console.error("Error creating user from webhook:", error);

    // If username already exists, try with a suffix
    if (error.code === "P2002" && error.meta?.target?.includes("username")) {
      try {
        const { id, email, phone, app_metadata, user_metadata } = userData;
        const fullName = user_metadata?.full_name || user_metadata?.name || "";
        const [firstName, ...lastNameParts] = fullName.split(" ");
        const lastName = lastNameParts.join(" ") || null;
        const username = `${email?.split("@")[0]}_${Date.now()}`;

        const newUser = await prisma.user.create({
          data: {
            userId: id,
            email,
            username,
            firstName: firstName || null,
            lastName,
            fullName,
            avatarUrl:
              user_metadata?.avatar_url || user_metadata?.picture || null,
            phone: phone || null,
            provider: app_metadata?.provider || null,
            providerId:
              user_metadata?.provider_id || user_metadata?.sub || null,
            emailVerified: user_metadata?.email_verified || false,
            phoneVerified: user_metadata?.phone_verified || false,
            isActive: true,
          },
        });

        console.log(
          `User created with unique username: ID=${newUser.id}, Email=${newUser.email}, AuthID=${newUser.userId}`
        );
      } catch (retryError) {
        console.error(
          "Failed to create user even with unique username:",
          retryError
        );
      }
    }
  }
};

// Handle different HTTP methods for webhooks
export const handleWebhookPost = handleWebhook;
export const handleWebhookPut = handleWebhook;
export const handleWebhookPatch = handleWebhook;
export const handleWebhookGet = handleWebhook;
export const handleWebhookDelete = handleWebhook;
