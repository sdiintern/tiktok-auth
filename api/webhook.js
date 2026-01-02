// api/webhook.js
// This handles incoming webhook events from TikTok and sends auto-replies

// Your TikTok API credentials
const APP_ID = '7576146137725878288';
const ACCESS_TOKEN = 'act.UevSun6gz95HQEH7YCBumkDvLmVDz8PdHrEnaPoZw70J509JkqzSuOxZIYeu!6197.s1'; // Replace with your current access token

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the webhook data from TikTok
        const webhookData = req.body;
        
        console.log('=== NEW WEBHOOK EVENT ===');
        console.log('Event Type:', webhookData.event);
        console.log('Timestamp:', new Date(webhookData.create_time * 1000).toISOString());
        console.log('Full Data:', JSON.stringify(webhookData, null, 2));
        
        // Parse the content field (it's a JSON string)
        let content = {};
        try {
            content = JSON.parse(webhookData.content);
        } catch (e) {
            console.log('Could not parse content:', e);
        }
        
        // Handle different event types
        switch (webhookData.event) {
            case 'im_receive_msg':
                await handleIncomingMessage(webhookData, content);
                break;
            case 'im_receive_msg_eu':
                console.log('🇪🇺 EU message received - limited data available');
                break;
            case 'im_send_msg':
                console.log('📤 Message sent successfully');
                break;
            default:
                console.log('Other event type:', webhookData.event);
        }
        
        // Always respond with 200 OK to acknowledge receipt
        return res.status(200).json({ 
            success: true, 
            message: 'Webhook received',
            event: webhookData.event 
        });
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        // Still return 200 to prevent TikTok from retrying
        return res.status(200).json({ 
            success: false, 
            error: error.message 
        });
    }
}

// Handle incoming messages from users and send auto-reply
async function handleIncomingMessage(webhookData, content) {
    console.log('📨 INCOMING MESSAGE');
    console.log('From:', content.from);
    console.log('To:', content.to);
    console.log('Conversation ID:', content.conversation_id);
    console.log('Message Type:', content.type);
    
    // Only auto-reply to text messages
    if (content.type === 'text') {
        const userMessage = content.text.body;
        console.log('User Message:', userMessage);
        
        // Generate auto-reply based on user message
        const autoReply = generateAutoReply(userMessage);
        
        // Send the auto-reply
        try {
            await sendMessage(
                webhookData.user_openid, // business_id
                content.conversation_id,
                autoReply
            );
            console.log('✅ Auto-reply sent successfully');
        } catch (error) {
            console.error('❌ Failed to send auto-reply:', error);
        }
    } else {
        console.log('Not a text message, skipping auto-reply');
    }
}

// Generate an auto-reply message based on user input
function generateAutoReply(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! 👋 Thanks for reaching out. How can I help you today?";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return "For pricing information, please visit our website or let me know what specific product you're interested in!";
    } else if (lowerMessage.includes('hours') || lowerMessage.includes('open')) {
        return "We're open Monday to Friday, 9 AM - 6 PM. How can I assist you?";
    } else if (lowerMessage.includes('help')) {
        return "I'm here to help! Please let me know what you need assistance with.";
    } else if (lowerMessage.includes('thank')) {
        return "You're welcome! Feel free to reach out if you have any other questions. 😊";
    } else {
        // Default response for unrecognized messages
        return `Thanks for your message! I've received: "${userMessage}". Someone from our team will get back to you shortly!`;
    }
}

// Send a message via TikTok Business Messaging API
async function sendMessage(businessId, conversationId, messageText) {
    const url = 'https://business-api.tiktok.com/open_api/v1.3/business/message/send/';
    
    const payload = {
        business_id: businessId,
        conversation_id: conversationId,
        message_type: "TEXT",  // This was missing!
        message: {
            text: messageText
        }
    };
    
    console.log('Sending message to TikTok API:', payload);
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Token': ACCESS_TOKEN
        },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.code !== 0) {
        console.error('TikTok API Error:', data);
        throw new Error(`TikTok API Error: ${data.message}`);
    }
    
    console.log('Message sent successfully:', data);
    return data;
}