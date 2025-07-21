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

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    this.chatInput.value = '';
    this.resetSendButton();
    this.showTypingIndicator();

    try {
      // ✅ FIX 1: Change /health to /chat
      const response = await fetch("http://localhost:5050/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      // ✅ FIX 2: Better error handling
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Server response:", data); // Debug log

      // ✅ FIX 3: Server sends 'reply', not 'response'
      if (data.reply) {
        this.addMessage(data.reply, 'bot');
      } else if (data.error) {
        this.addMessage(`❌ Error: ${data.error}`, 'bot');
      } else {
        this.addMessage("⚠️ Empty response from AI.", 'bot');
      }
    } catch (error) {
      this.addMessage("❌ Sorry, an error occurred. Check console for details.", 'bot');
      console.error("Chat error:", error);
    }

    this.hideTypingIndicator();
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
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ChatBot();
});