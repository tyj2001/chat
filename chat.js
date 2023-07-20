const apiUrl = 'https://purgpt.xyz/v1/chat/completions';
const apiKey = 'purgpt-5bqnjwv8wn3w8lxcctesuk';

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

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const userMessage = messageInput.value;
    if (userMessage.trim() === '') return;

    appendMessage('user', userMessage);
    messageInput.value = '';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            messages: getChatMessages(),
            max_tokens: 2048, // Adjust as needed
            temperature: 0.7,
            top_p: 1,
            stream: false,
            stop: "\n",
            model: 'gpt-3.5-turbo'
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
