// api/webhook.js
// This handles incoming webhook events from TikTok

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
                handleIncomingMessage(webhookData, content);
                break;
            case 'im_send_msg':
                handleSentMessage(webhookData, content);
                break;
            case 'im_receive_msg_eu':
                handleEUMessage(webhookData, content);
                break;
            case 'im_referral_msg':
                handleReferralMessage(webhookData, content);
                break;
            case 'im_mark_read_msg':
                handleMarkRead(webhookData, content);
                break;
            case 'im_auto_message_config_update':
                handleAutoMessageUpdate(webhookData, content);
                break;
            case 'im_auto_message_audit_update':
                handleAutoMessageAudit(webhookData, content);
                break;
            case 'im_receive_high_intent_comment':
                handleHighIntentComment(webhookData, content);
                break;
            default:
                console.log('Unknown event type:', webhookData.event);
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

// Handle incoming messages from users
function handleIncomingMessage(webhookData, content) {
    console.log('📨 INCOMING MESSAGE');
    console.log('From:', content.from);
    console.log('To:', content.to);
    console.log('Conversation ID:', content.conversation_id);
    console.log('Message Type:', content.type);
    
    if (content.type === 'text') {
        console.log('Message:', content.text.body);
    } else if (content.type === 'image') {
        console.log('Image Media ID:', content.image.media_id);
    }
    
    console.log('Is Follower:', content.is_follower);
    
    // TODO: Add your auto-reply logic here
    // You could call TikTok's send message API to respond automatically
}

// Handle messages you sent
function handleSentMessage(webhookData, content) {
    console.log('📤 SENT MESSAGE');
    console.log('From:', content.from);
    console.log('To:', content.to);
    console.log('Message Type:', content.type);
    
    if (content.type === 'text') {
        console.log('Message:', content.text.body);
    }
}

// Handle EU messages (limited data)
function handleEUMessage(webhookData, content) {
    console.log('🇪🇺 EU MESSAGE RECEIVED');
    console.log('To:', content.to);
    console.log('Timestamp:', new Date(content.timestamp).toISOString());
    console.log('Note: Full message content not available for EU messages');
}

// Handle referral messages (from ads or links)
function handleReferralMessage(webhookData, content) {
    console.log('🔗 REFERRAL MESSAGE');
    console.log('From:', content.from);
    console.log('Referral Source:', content.referral.source);
    
    if (content.referral.source === 'ad') {
        console.log('Ad ID:', content.referral.ad.ad_id);
        console.log('Advertiser ID:', content.referral.ad.advertiser_id);
    } else if (content.referral.source === 'short_link') {
        console.log('Ref:', content.referral.short_link.ref);
        console.log('Prefilled Message:', content.referral.short_link.prefilled_message);
    }
}

// Handle mark as read events
function handleMarkRead(webhookData, content) {
    console.log('✅ MESSAGES MARKED AS READ');
    console.log('From:', content.from);
    console.log('Last Read Timestamp:', new Date(content.read.last_read_timestamp).toISOString());
}

// Handle automatic message config updates
function handleAutoMessageUpdate(webhookData, content) {
    console.log('⚙️ AUTO MESSAGE CONFIG UPDATE');
    console.log('Type:', content.auto_message_type);
    console.log('Action:', content.auto_message_action);
    console.log('Message ID:', content.auto_message_id);
}

// Handle automatic message audit updates
function handleAutoMessageAudit(webhookData, content) {
    console.log('🔍 AUTO MESSAGE AUDIT UPDATE');
    console.log('Type:', content.auto_message_type);
    console.log('Status:', content.audit_status);
    console.log('Message ID:', content.auto_message_id);
}

// Handle high intent comments
function handleHighIntentComment(webhookData, content) {
    console.log('💬 HIGH INTENT COMMENT');
    console.log('From:', content.from);
    console.log('Comment:', content.comment_text);
    console.log('Comment ID:', content.comment_id);
    
    // TODO: You might want to automatically reach out via DM
}