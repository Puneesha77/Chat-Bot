class ChatBot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.init();
    }

    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Add input animation
        this.chatInput.addEventListener('input', () => {
            if (this.chatInput.value.trim()) {
                this.sendButton.style.background = 'linear-gradient(135deg, #ff6b6b, #feca57)';
            } else {
                this.sendButton.style.background = 'linear-gradient(135deg, #feca57, #ff9ff3)';
            }
        });
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.resetSendButton();
        
        this.showTypingIndicator();
        
        // Simulate bot response
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addBotResponse(message);
        }, 1000 + Math.random() * 2000);
    }

    addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        const bubbleElement = document.createElement('div');
        bubbleElement.className = 'message-bubble';
        bubbleElement.textContent = message;
        
        messageElement.appendChild(bubbleElement);
        this.chatMessages.appendChild(messageElement);
        
        this.scrollToBottom();
    }

    addBotResponse(userMessage) {
        const responses = [
            "That's interesting! Tell me more about that.",
            "I understand what you're saying. How can I help you further?",
            "Thanks for sharing that with me. What would you like to know?",
            "I'm here to help! What else can I assist you with?",
            "Great question! Let me think about that for a moment.",
            "I appreciate you asking. Is there anything specific you'd like to explore?",
            "That's a good point. Would you like me to elaborate on anything?",
            "I'm glad you brought that up. What's your next question?"
        ];
        
        // Simple keyword-based responses
        const lowerMessage = userMessage.toLowerCase();
        let response;
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            response = "Hello! It's great to meet you. How can I help you today?";
        } else if (lowerMessage.includes('how are you')) {
            response = "I'm doing well, thank you for asking! How are you doing?";
        } else if (lowerMessage.includes('name')) {
            response = "I'm your AI assistant! You can call me whatever you'd like. What's your name?";
        } else if (lowerMessage.includes('weather')) {
            response = "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for the most current information!";
        } else if (lowerMessage.includes('time')) {
            response = `The current time is ${new Date().toLocaleTimeString()}. Is there anything else I can help you with?`;
        } else if (lowerMessage.includes('help')) {
            response = "I'm here to help! You can ask me questions, have a conversation, or just chat. What would you like to talk about?";
        } else {
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        this.addMessage(response, 'bot');
    }

    showTypingIndicator() {
        this.typingIndicator.classList.add('show');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.remove('show');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    resetSendButton() {
        this.sendButton.style.background = 'linear-gradient(135deg, #feca57, #ff9ff3)';
    }
    async addBotResponse(userMessage) {
    this.showTypingIndicator();
    try {
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        const data = await response.json();
        this.addMessage(data.response, 'bot');
    } catch (err) {
        this.addMessage("Sorry, I couldn't reach the server.", 'bot');
    } finally {
        this.hideTypingIndicator();
    }
}

}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});
