(function (global) {
    window.addEventListener('DOMContentLoaded', function () {
        const CHATBOT_ID = "chatBotButton";
        const CHAT_FORM_ID = "chatForm";
        const API_BASE = "https://chatbotweb-api.vercel.app";

        let botNumber = null;

        // Add bounce animation style
        const style = document.createElement('style');
        style.innerHTML = `
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); } 
            40% { transform: scale(1); }
        }`;
        document.head.appendChild(style);

        // Create Chat Button
        const chatBot = document.getElementById(CHATBOT_ID) || createChatButton();
        chatBot.onclick = showChatForm;

        function createChatButton() {
            const button = document.createElement('button');
            button.id = CHATBOT_ID;

            const img = document.createElement('img');
            img.src = "https://example-chatapp.vercel.app/photos/chatbot_purple.png";
            img.style.width = "200px";
            img.style.borderRadius = "50%";

            Object.assign(button.style, {
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'fixed',
                bottom: '0px',
                right: '10px',
            });

            button.appendChild(img);
            document.body.appendChild(button);
            return button;
        }

        function showChatForm() {
            chatBot.style.display = "none";
            let formContainer = document.getElementById(CHAT_FORM_ID);
            if (formContainer) {
                formContainer.style.display = "flex";
                return;
            }

            formContainer = document.createElement("div");
            formContainer.id = CHAT_FORM_ID;
            Object.assign(formContainer.style, {
                position: "fixed",
                bottom: "10px",
                right: "50px",
                width: "380px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
            });

            formContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; justify-content: space-between; background-color: #8E44AD; color: white; border-radius: 2px">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding:5px 12px; font-size: 18px; font-weight: bold;">
                        <p style="font-size: 25px;">Torus Digital</p>
                        <span id="cancelButton" style="cursor:pointer; font-size:35px">&times;</span>
                    </div>  
                    <p style="font-size: 12px; padding: 2px 15px 0px 15px ">Your AI Assistant</p> 
                </div>
                <a href="https://www.telerivet.com/" target="_blank" style="text-decoration: none"><p style="text-align: right; padding:5px; color: #3ba8e0; font-size: 12px">Powered by Telerivet</p></a>
                <div id="chatBody" style="flex-grow: 1; width: auto; height: 40vh; min-height: 350px; max-height: 400px; display: flex; flex-direction: column; overflow-y:auto; padding: 10px;">
                    <div id="start_conv" class="bot-message" style="display: flex; flex-direction: row; align-items: flex-start; width: 90%;">
                        <div class="avatar" style="margin-right: 10px; margin-top:10px; border: 1px solid #3ba8e0; border-radius: 50%; width: 35px; height: 35px; display:flex; align-items:center; justify-content: center">
                            <img src="https://example-chatapp.vercel.app/photos/robot.png";" alt="Bot Avatar" style="width: 25px; height: 25px;">
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; gap:10px;width:80%">
                            <div class="message-container" style="background-color: #f1f1f1; padding: 10px; border-radius: 10px 10px 10px 0px;">
                                <div style="padding: 5px;">Welcome, Please Click the button to start the conversation!</div>
                            </div>
                            <button class="chat-option" data-response="Lets Start" style="border: 1px solid #8E44AD; background-color: transparent; padding: 8px 12px; cursor: pointer; border-radius: 10px; color: #8E44AD; width: 100%;">Let's Start</button>
                        </div> 
                    </div>
                </div>
                <div id="sendDiv" style="background-color: white; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding: 10px; display: none; justify-content:center; align-items:center">
                    <div id="home" style="cursor: pointer; margin-right: 10px;">
                        <img src="https://example-chatapp.vercel.app/photos/home.png" style="width: 25px; height: 25px;" />
                    </div>
                    <input id="input" type="text" placeholder="Say something..." autocomplete="off" 
                        style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 5px; outline: none; margin-right: 10px;" />
                    <button id="sendButton"
                        style="padding: 8px 12px; background-color: #8E44AD; color: white; border: none; border-radius: 5px; cursor: pointer;">Send</button>
                </div>
            `;
            document.body.appendChild(formContainer);

            initChatEvents();
        }

        function initChatEvents() {
            const inputField = document.getElementById("input");
            const sendButton = document.getElementById("sendButton");
            const sendDiv = document.getElementById("sendDiv");
            const cancelButton = document.getElementById("cancelButton");
            const chatBody = document.getElementById("chatBody");
            const homeButton = document.getElementById("home");

            sendButton.onclick = () => sendUserMessage();
            inputField.onkeydown = (e) => e.key === "Enter" && sendUserMessage();

            cancelButton.onclick = () => {
                chatBot.style.display = "flex";
                document.getElementById(CHAT_FORM_ID).style.display = "none";
            };

            homeButton.onclick = () => {
                const clearElement = chatBody.querySelectorAll(".user-message, .bot-message")
                clearElement.forEach(e => e.remove())
                chatBody.scrollTop = 0;
                sendBackend("Main menu", botNumber);
            };

            chatBody.addEventListener("click", function (e) {
                if (e.target && e.target.classList.contains("chat-option")) {
                    const message = e.target.dataset.response;
                    appendMessage(message, "user");
                    sendBackend(message, botNumber);
                    sendDiv.style.display = "flex";

                    const startConv = document.getElementById("start_conv");
                    if (startConv) startConv.style.display = "none";
                }
            });

            function showTypingIndicator() {
                const typingDiv = document.createElement("div");
                typingDiv.id = "typingIndicator";
                typingDiv.style.display = "flex";
                typingDiv.style.alignItems = "center";
                typingDiv.style.marginBottom = "20px";
                typingDiv.style.marginLeft = "10px";

                typingDiv.innerHTML = `
                    <div style="display:flex; gap: 4px;">
                        <span style="width:8px; height:8px; background:#8E44AD; border-radius:50%; animation: bounce 1.2s infinite ease-in-out;"></span>
                        <span style="width:8px; height:8px; background:#8E44AD; border-radius:50%; animation: bounce 1.2s infinite ease-in-out; animation-delay: .2s;"></span>
                        <span style="width:8px; height:8px; background:#8E44AD; border-radius:50%; animation: bounce 1.2s infinite ease-in-out; animation-delay: .4s;"></span>
                    </div>
                `;
                chatBody.appendChild(typingDiv);
                chatBody.scrollTop = chatBody.scrollHeight;
            }

            function removeTypingIndicator() {
                const typing = document.getElementById("typingIndicator");
                if (typing) typing.remove();
            }

            function sendUserMessage() {
                const input = inputField.value.trim();
                if (!input) return;
                appendMessage(input, "user");
                sendBackend(input, botNumber);
                inputField.value = "";
            }

            function appendMessage(message, sender) {
                const messageDiv = document.createElement("div");
                messageDiv.className = sender === "bot" ? "bot-message" : "user-message";
                messageDiv.style.display = "flex";
                messageDiv.style.flexDirection = "row";
                messageDiv.style.alignItems = "flex-start";
                messageDiv.style.marginBottom = "30px";
                messageDiv.style.width = "100%";
                messageDiv.style.justifyContent = sender === "bot" ? "flex-start" : "flex-end";

                const avatar = document.createElement("div");
                avatar.className = "avatar";
                avatar.style.margin = sender === "bot" ? "10px 10px 0 0" : "5px 0 0 10px";
                avatar.style.border = "1px solid #3ba8e0";
                avatar.style.borderRadius = "50%";
                avatar.style.width = sender === "bot" ? "35px" : "30px";
                avatar.style.height = sender === "bot" ? "35px" : "30px";
                avatar.style.display = "flex";
                avatar.style.alignItems = "center";
                avatar.style.justifyContent = "center";
                avatar.innerHTML = `<img src="${sender === 'bot' ? 'https://example-chatapp.vercel.app/photos/robot.png' : 'https://example-chatapp.vercel.app/photos/people.png'}" alt="${sender === 'bot' ? 'Bot' : 'User'} Avatar" style="width: ${sender === 'bot' ? '25px' : '20px'}; height: ${sender === 'bot' ? '25px' : '20px'}; border-radius: 50%;">`;

                const messageWrapper = document.createElement("div");
                messageWrapper.style.display = "flex";
                messageWrapper.style.flexDirection = "column";
                messageWrapper.style.alignItems = sender === "bot" ? "flex-start" : "flex-end";
                messageWrapper.style.maxWidth = "80%";

                const messageBubble = document.createElement("div");
                messageBubble.style.backgroundColor = sender === "bot" ? "#f1f1f1" : "#8E44AD";
                messageBubble.style.color = sender === "bot" ? "black" : "white";
                messageBubble.style.padding = "10px";
                messageBubble.style.borderRadius = "10px";

                if (sender === "bot") {
                    const [msgOnly, ...buttonParts] = message.botMessage.split(/(?=<button)/);
                    messageBubble.innerHTML = msgOnly.trim();
                    messageWrapper.appendChild(messageBubble);

                    if (buttonParts.length) {
                        const buttonWrapper = document.createElement("div");
                        buttonWrapper.style.display = "flex";
                        buttonWrapper.style.flexWrap = "wrap";
                        buttonWrapper.style.marginTop = "5px";
                        buttonWrapper.innerHTML = buttonParts.join("");
                        messageWrapper.appendChild(buttonWrapper);
                    }

                    messageDiv.appendChild(avatar);
                    messageDiv.appendChild(messageWrapper);
                } else {
                    messageBubble.innerHTML = message;
                    messageWrapper.appendChild(messageBubble);
                    messageDiv.appendChild(messageWrapper);
                    messageDiv.appendChild(avatar);
                }

                chatBody.appendChild(messageDiv);
                chatBody.scrollTop = chatBody.scrollHeight;
            }

            function convertTextToButtons(text) {
                const buttonPattern = /#\$(.*?)\$#/g;
                return text.replace(buttonPattern, (match, content) => {
                    return `<button class="chat-option" data-response="${content}" style="border: 1px solid #8E44AD; background-color: transparent; padding:8px 12px; cursor:pointer; border-radius:10px; color: #8E44AD; margin: 5px 5px 0 0; width:100%">${content}</button>`;
                });
            }

            async function sendBackend(message, number) {
                try {
                    showTypingIndicator();

                    const response = await fetch(`${API_BASE}/send`, {
                        method: "POST",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({ textMessage: message, number: number })
                    });

                    const data = await response.json();
                    if (data && data.value.message) {
                        setTimeout(async () => {
                            try {
                                const response2 = await fetch(`${API_BASE}/getMessage`, {
                                    method: "GET",
                                    headers: { "Content-type": "application/json" },
                                });
                                const data2 = await response2.json();
                                removeTypingIndicator();

                                if (data2) {
                                    botNumber = data2.value.bot_web_id;
                                    let botMsg = data2.value.message;

                                    if (data2.value.media) {
                                        const mediaURL = data2.value.media;
                                        const mediaHtml = `<a href="${mediaURL}" target="_blank"><img src="${mediaURL}" alt="Image" style="max-width: 100%; border-radius: 10px;"></a>`;
                                        botMsg = `${mediaHtml}${botMsg}`;
                                    }

                                    if (data2.value.url) {
                                        const buttonHtml = `<a href="${data2.value.url}" target="_blank" style="text-decoration: none;">${data2.value.url}</a>`;
                                        botMsg = botMsg.replace(data2.value.url, buttonHtml);
                                    }

                                    const parsedMessage = convertTextToButtons(botMsg);
                                    appendMessage({ botMessage: parsedMessage }, "bot");
                                }
                            } catch (error) {
                                removeTypingIndicator();
                                console.error(`Error getting message from API: ${error}`);
                            }
                        }, 600);
                    }
                } catch (error) {
                    removeTypingIndicator();
                    console.error(`Error sending message to backend: ${error}`);
                }
            }
        }
    });
})(window);
