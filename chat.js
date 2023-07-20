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
            max_tokens: 50, // Adjust as needed
            temperature: 0.7,
            top_p: 1,
            stream: true,
            stop: "\n",
            model: 'gpt-3.5-turbo'
        })
    });

    if(response.ok) {
        let assistantOutput = '';
        let responseBuffer = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });

            responseBuffer += chunk;

            let newlineIndex;
            while ((newlineIndex = responseBuffer.indexOf('\n')) !== -1) {
                const line = responseBuffer.slice(0, newlineIndex).trim();
                responseBuffer = responseBuffer.slice(newlineIndex + 1);

                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr.length) continue;

                    try {
                        const object = JSON.parse(jsonStr);
                        const choices = object['choices'];
                        if (choices && choices.length > 0) {
                            const delta = choices[0]['delta'];
                            if (delta && 'content' in delta) {
                                const message = delta['content'];
                                assistantOutput += message;
                            }
                        }
                    } catch (error) {
                        console.error('JSON parsing error:', error, jsonStr);
                    }
                }
            }  
        }

        appendMessage('assistant', assistantOutput);    
    } else {
        console.error(`API request failed: ${response.status}`);
    }
}

