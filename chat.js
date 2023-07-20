const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions';
const apiKey = 'purgpt-5bqnjwv8wn3w8lxcctesuk'; // 请替换这一行为你的API密钥.

function getChatMessages() {
    return [...document.getElementById('chat-box').children].map(msgDiv => {
        const cls = msgDiv.classList[0];
        const content = msgDiv.innerText.trim();
        return {role: cls, content: content};
    });
}

function appendMessage(role, message) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add(role);
    msgDiv.innerText = message;
    document.getElementById('chat-box').appendChild(msgDiv);
}

document.getElementById('message-form').addEventListener('submit', function(e) {
    e.preventDefault();
    sendMessage();
});

const sendMessage = async () => {
    const messageInput = document.getElementById('message-input');
    const userMessage = messageInput.value;
    if (userMessage.trim() === '') return;

    appendMessage('user', userMessage);
    messageInput.value = '';

    const chatMessages = getChatMessages();

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: chatMessages,
            max_tokens: 500, 
            temperature: 0.7,
            top_p: 1,
            stream: false, 
        })
    });

    if(response.ok) {
        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        appendMessage('assistant', assistantMessage);
    } else {
        console.error(`API request failed: ${response.status}`);
    }
}
