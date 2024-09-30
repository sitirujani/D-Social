import { v4 as uuidv4 } from 'uuid';
import { ic, nat64, nat32, StableBTreeMap, $query, $update } from 'azle';

// Define the Message data structure
class Message {
    id: string;
    title: string;
    body: string;
    attachmentURL: string;
    createdAt: nat64;
    updatedAt: nat64 | null;
}

// Initialize StableBTreeMap for storing messages, which persists across canister upgrades
const messagesStorage = new StableBTreeMap<string, Message>(0, 44, 1024);

// Helper function to get current timestamp in nanoseconds (required for ICP)
function getCurrentTime(): nat64 {
    return ic.time() as nat64;
}

// Create a new message and store it in the decentralized storage
$update;
export function createMessage(title: string, body: string, attachmentURL: string): Message {
    const newMessage: Message = {
        id: uuidv4(),
        title,
        body,
        attachmentURL,
        createdAt: getCurrentTime(),
        updatedAt: null
    };
    
    messagesStorage.insert(newMessage.id, newMessage);
    return newMessage;
}

// Retrieve all messages from storage
$query;
export function getAllMessages(): Message[] {
    return messagesStorage.values();
}

// Retrieve a single message by its ID
$query;
export function getMessageById(messageId: string): Message | string {
    const messageOpt = messagesStorage.get(messageId);
    if (messageOpt === undefined) {
        return `Message with id=${messageId} not found`;
    }
    return messageOpt;
}

// Update an existing message by its ID
$update;
export function updateMessage(messageId: string, title: string, body: string, attachmentURL: string): Message | string {
    const messageOpt = messagesStorage.get(messageId);
    
    if (messageOpt === undefined) {
        return `Couldn't update message with id=${messageId}. Message not found`;
    }

    const updatedMessage: Message = {
        ...messageOpt,
        title,
        body,
        attachmentURL,
        updatedAt: getCurrentTime()
    };

    messagesStorage.insert(messageId, updatedMessage);
    return updatedMessage;
}

// Delete a message by its ID
$update;
export function deleteMessage(messageId: string): Message | string {
    const deletedMessage = messagesStorage.remove(messageId);

    if (deletedMessage === undefined) {
        return `Couldn't delete message with id=${messageId}. Message not found`;
    }
    return deletedMessage;
}
