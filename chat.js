const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions'; // Your actual API URL
const apiKey = 'YOUR API KEY'; // Your actual API Key

// Message handling
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

// Event handler for the form submission
document.getElementById('message-form').addEventListener('submit', function(e) {
  e.preventDefault();
  sendMessage();
});

// Message sending
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

  if (response.ok) {
    let text = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) { 
        try {
          const object = JSON.parse(text);
          message = object['choices'][0]['message']['content'];
          appendMessage('assistant', message);
        } catch (error) {
          console.error(error);
        }
        break; 
      }
      text += decoder.decode(value);
      try {
        const object = JSON.parse(text);
        text = '';
        message = object['choices'][0]['message']['content'];
        appendMessage('assistant', message);
      } catch (error) {
        continue;
      }
    }
  } else {
    console.error(`API request failed: ${response.status}`);
  }
}
