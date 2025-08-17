import { Request, Response } from 'express';
import prisma from '../models/prisma';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const headers = req.headers;
    const body = req.body;
    const query = req.query;

    // Log the complete webhook payload
    console.log('=== WEBHOOK RECEIVED ===');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log(`Headers:`, JSON.stringify(headers, null, 2));
    console.log(`Query Parameters:`, JSON.stringify(query, null, 2));
    console.log(`Body:`, JSON.stringify(body, null, 2));
    console.log('========================');

    // Handle user creation webhook from Supabase auth
    if (body?.metadata?.name === 'before-user-created' && body?.user) {
      await handleUserCreation(body.user);
    }

    // Send acknowledgment response
    res.status(204).json({});

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      timestamp: new Date().toISOString()
    });
  }
};

// Handle user creation from auth webhook
const handleUserCreation = async (userData: any) => {
  try {
    const { id: authId, email, user_metadata } = userData;
    
    // Extract user information
    const fullName = user_metadata?.full_name || user_metadata?.name || '';
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ') || null;
    
    // Generate username from email or use auth ID
    const username = email?.split('@')[0] || authId?.substring(0, 8) || `user_${Date.now()}`;

    console.log(`Creating user in database: ${email}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return;
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        firstName: firstName || null,
        lastName,
        isActive: true
      }
    });

    console.log(`User created successfully: ID=${newUser.id}, Email=${newUser.email}`);

  } catch (error) {
    console.error('Error creating user from webhook:', error);
    
    // If username already exists, try with a suffix
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      try {
        const { email, user_metadata } = userData;
        const fullName = user_metadata?.full_name || user_metadata?.name || '';
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ') || null;
        const username = `${email?.split('@')[0]}_${Date.now()}`;

        const newUser = await prisma.user.create({
          data: {
            email,
            username,
            firstName: firstName || null,
            lastName,
            isActive: true
          }
        });

        console.log(`User created with unique username: ID=${newUser.id}, Email=${newUser.email}`);
      } catch (retryError) {
        console.error('Failed to create user even with unique username:', retryError);
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
