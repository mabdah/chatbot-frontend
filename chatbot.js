
(function (global) {
    window.addEventListener('DOMContentLoaded', function () {
        const buttonId = "chatBotButton";
        let chatBot = document.getElementById(buttonId);

        if (!chatBot) {
            chatBot = document.createElement('button');
            chatBot.id = buttonId;
            document.body.appendChild(chatBot);
        }

        const img = document.createElement('img');
        img.src = "https://example-chatapp.vercel.app/photos/Chat.png";
        img.style.width = "200px";
        img.style.height = "auto";
        img.style.borderRadius = "50%";

        Object.assign(chatBot.style, {
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            bottom: "0px",
            right: "10px",
        });
        chatBot.appendChild(img);

        chatBot.onclick = function () {
            let formContainer = document.getElementById("chatForm");
            if (formContainer) {
                formContainer.style.display = "flex";
                chatBot.style.display = "none";
                return;
            }
            chatBot.style.display = "none";
            formContainer = document.createElement("div");
            formContainer.id = "chatForm";
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

            const form = document.createElement("main");
            form.innerHTML = ` 
                <div style="display: flex; flex-direction: column; justify-content: space-between; background-color: #ffbc17; color: white; border-radius: 2px">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding:5px 15px 5px 15px; font-size: 18px; font-weight: bold;">
                        <p>Chat</p>
                        <span id="cancelButton" style="cursor:pointer; font-size:35px">&times;</span>
                    </div>   
                </div>

                <div id="chatBody" style="flex-grow: 1; width: auto; height: 40vh; min-height: 350px; max-height: 400px; display: flex; flex-direction: column; overflow-y:auto; padding: 10px;">
                    <div class="bot-message" style="display: flex; flex-direction: column; align-items:flex-start">
                        <div style="background-color: #f1f1f1; padding: 10px; border-radius: 10px 10px 10px 0px;">
                            <div style="padding:5px">Welcome, Please Click the button to start the conversation!</div>  
                        </div>
                        <div style="display:flex; margin:5px;">
                            <button class="chat-option" data-response="Lets Start" style="border: 1px solid #ffbc17; background-color: transparent; padding:8px 12px; cursor:pointer; border-radius:10px; color: #ffbc17">Lets Start</button>
                        </div>
                    </div>
                </div>

                <div id ="sendDiv" style="background-color: white; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding: 10px; display: none">
                    <input id="input" type="text" placeholder="Say something..." autocomplete="off" 
                        style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 5px; outline: none; margin-right: 10px;" />
                    <button id="sendButton"
                        style="padding: 8px 12px; background-color: #ffbc17; color: white; border: none; border-radius: 5px; cursor: pointer;">Send</button>
                </div>
            `;

            formContainer.appendChild(form);
            document.body.appendChild(formContainer);

            const inputField = document.getElementById("input");
            const sendButton = document.getElementById("sendButton");
            const sendDiv = document.getElementById("sendDiv")
            const cancelButton = document.getElementById("cancelButton");
            const chatBody = document.getElementById("chatBody");

            sendButton.addEventListener("click", sendUserMessage);
            inputField.addEventListener("keydown", function (e) {
                if (e.code === "Enter") {
                    sendUserMessage();
                }
            });
            let botNumber = null; // for number to be access globally
            function sendUserMessage() {
                let input = inputField.value;
                if (input.trim()) {
                    sendMessage(input, "user");
                    sendBackend(input, botNumber);
                    inputField.value = "";
                }
            }

            document.querySelectorAll(".chat-option").forEach(button => {
                button.addEventListener("click", function () {
                    sendMessage(this.dataset.response, "user");
                    sendBackend(this.dataset.response);

                    // ✅ Enable send button after click
                    // sendButton.disabled = false;
                    sendDiv.style.display = "flex";
                    // sendButton.style.opacity = "1";
                });
            });

            function sendMessage(message, sender) {
                const messageDiv = document.createElement("div");
                messageDiv.className = sender === "bot" ? "bot-message" : "user-message";
                messageDiv.style.display = "flex";
                messageDiv.style.flexDirection = "column";
                messageDiv.style.alignItems = sender === "bot" ? "flex-start" : "flex-end";

                const userMessage = document.createElement("div");
                userMessage.style.backgroundColor = sender === "bot" ? "#f1f1f1" : "#ffbc17";
                userMessage.style.padding = "10px";
                userMessage.style.margin = "5px 0px";
                userMessage.style.borderRadius = sender === "bot" ? "10px 10px 10px 0px" : "10px 10px 0px 10px";
                userMessage.style.color = sender === "bot" ? "black" : "white";
                userMessage.innerText = sender === "bot" ? message.botMessage : message;

                messageDiv.appendChild(userMessage);
                chatBody.appendChild(messageDiv);
            }


            async function sendBackend(message, number) {
                try {
                    const response = await fetch("https://chatbotweb-api.vercel.app/send", {
                        method: "POST",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({ textMessage: message, number: number })
                    });

                    const data = await response.json();
                    if (data && data.value.message) {
                        setTimeout(async () => {
                            try {
                                const response2 = await fetch("https://chatbotweb-api.vercel.app/getMessage", {
                                    method: "GET",
                                    headers: { "Content-type": "application/json" },
                                });
                                const data2 = await response2.json();
                                if (data2) {
                                    botNumber = data2.value.bot_web_id;  // Store the number globally
                                    sendMessage({ botMessage: data2.value.message, userMessage: data.value.message, number: botNumber }, "bot");
                                }
                            } catch (error) {
                                console.error(`Error getting message from API: ${error}`);
                            }
                        }, 600);
                    }
                } catch (error) {
                    console.error(`Error sending message to backend: ${error}`);
                }
            }

            cancelButton.addEventListener("click", function () {
                chatBot.style.display = "flex";
                formContainer.style.display = "none";
            });
        };
    });
})(window);

