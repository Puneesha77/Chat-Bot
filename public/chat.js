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
      // Use relative URL instead of absolute localhost URL
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.hideTypingIndicator();

      if (data && data.reply) {
        this.addMessage(data.reply, 'bot');
      } else {
        this.addMessage("Sorry, I didn't understand that.", 'bot');
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(`Error: ${error.message}`, 'bot');
      console.error("Chat error:", error);
    }
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

document.addEventListener('DOMContentLoaded', () => {
  new ChatBot();
});