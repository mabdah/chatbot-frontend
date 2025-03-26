
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
        img.src = "https://example-chatapp.vercel.app/photos/chatbot.png";
        img.style.width = "150px";
        img.style.height = "150px";

        Object.assign(chatBot.style, {
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            // borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            bottom: "10px",
            right: "40px",
        });
        chatBot.appendChild(img);

        chatBot.onclick = function () {
            if (document.getElementById("chatForm")) return;
            chatBot.style.display = "none";

            const formContainer = document.createElement("div");
            formContainer.id = "chatForm";
            Object.assign(formContainer.style, {
                position: "fixed",
                bottom: "10px",
                right: "50px",
                width: "350px",
                height: "60vh",  // Dynamic height
                maxHeight: "500px", // Ensures it doesn't get too tall
                minHeight: "400px", // Ensures usability on small screens
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
            });

            const form = document.createElement("main");
            form.innerHTML = ` 
                <div style="display: flex; flex-direction: column; justify-content: space-between; background-color: #135fbc; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px; ">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px;  font-size: 18px; font-weight: bold; ">
                <p> Chat</p>
                <span id="cancelButton" style="cursor:pointer">&times;</span>
                </div>   
                <p style="display: flex; font-size: 16px; padding: 5px;" >Design by Telerivet</p>
                </div>

                <div id="chatBody" style="flex-grow: 1; width: auto; height: 40vh; min-height: 250px; max-height: 350px; display: flex; flex-direction: column; overflow-y:auto; padding: 10px;">
                    <div class="bot-message" style="display: flex; flex-direction: column; align-items:flex-start">
                        <div style="background-color: #f1f1f1; padding: 10px; border-radius: 10px;">
                           <div style="padding:5px">Welcome, Click the button to start conversation!</div>  
                        </div>
                        <div style="display:flex; margin:5px;">
                                <button class="chat-option" data-response="Lets Start" style="border: 1px solid #135fbc; background-color: transparent; padding:8px 12px; cursor:pointer; border-radius:10px; color: #135fbc">Lets Start</button>
                            </div>
                    </div>
                     
                </div>
                <div style="display: flex; background-color: white; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding: 10px;">
                    <input id="input" type="text" placeholder="Say something..." autocomplete="off" 
                        style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 5px; outline: none; margin-right: 10px;"/>
                    <button id="sendButton" 
                        style="padding: 8px 12px; background-color: #135fbc; color: white; border: none; border-radius: 5px; cursor: pointer;">Send</button>
                </div>

               
            `;

            formContainer.appendChild(form);
            document.body.appendChild(formContainer);

            const inputField = document.getElementById("input");
            // const sendButton = document.getElementById("sendButton");
            const cancelButton = document.getElementById("cancelButton");
            const chatBody = document.getElementById("chatBody");

            //when send is clicked
            sendButton.addEventListener("click", sendUserMessage);
            //when enter is pressed
            inputField.addEventListener("keydown", function (e) {
                if (e.code === "Enter") {
                    sendUserMessage();
                }
            });

            function sendUserMessage() {
                let input = inputField.value;
                console.log("I typed", input);
                if (input.trim()) {
                    sendMessage(input, "user");
                    sendBackend(input);
                    inputField.value = "";
                }
            }

            //when option button is clicked
            document.querySelectorAll(".chat-option").forEach(button => {
                button.addEventListener("click", function () {
                    sendMessage(this.dataset.response, "user");
                    sendBackend(this.dataset.response);
                });
            });

            function sendMessage(message, sender) {
                console.log(message, sender, "this is message")
                const messageDiv = document.createElement("div");
                messageDiv.className = sender === "bot" ? "bot-message" : "user-message";
                messageDiv.style.display = "flex";
                messageDiv.style.flexDirection = "column";
                messageDiv.style.alignItems = sender === "bot" ? "flex-start" : "flex-end";
                const userMessage = document.createElement("div");
                userMessage.style.backgroundColor = sender === "bot" ? "#f1f1f1" : "#135fbc";
                userMessage.style.padding = "10px";
                userMessage.style.margin = "5px 0px 5px 0px";
                userMessage.style.borderRadius = "10px";
                userMessage.style.color = sender === "bot" ? "black" : "white";
                userMessage.innerText = sender === "bot" ? message.message1 : message;

                if (message.message2 && message.message2.toLowerCase() === "lets start") {
                    const buttonContainer = document.createElement("div");
                    buttonContainer.style.display = "flex";
                    buttonContainer.style.flexDirection = "column"
                    buttonContainer.style.gap = "10px";
                    buttonContainer.style.marginTop = "5px";

                    const options = ["About", "Contacts", "Services"];

                    options.forEach(option => {
                        const button = document.createElement("button");
                        button.innerText = option;
                        button.style.padding = "8px 12px"
                        button.style.border = "1px solid #135fbc";
                        button.style.borderRadius = "10px";
                        button.style.cursor = "pointer";
                        button.style.backgroundColor = "transparent";
                        button.style.color = "#135fbc";
                        button.onclick = () => { sendMessage(option, "user"); sendBackend(option, message.number) }
                        buttonContainer.appendChild(button);
                    });
                    messageDiv.appendChild(userMessage);
                    messageDiv.appendChild(buttonContainer);
                } else {
                    messageDiv.appendChild(userMessage);
                }

                chatBody.appendChild(messageDiv);
            }

            // API Call to backend using async/await
            async function sendBackend(message, number) {
                console.log(message, number, "inside sendBackend")
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
                                })
                                const data2 = await response2.json()
                                console.log(data2, "this is data2")
                                if (data2) {
                                    sendMessage({ message1: data2.value, message2: data.value.message, number: data.value.uniqueTestNumber }, "bot")
                                }

                            }
                            catch (error) {
                                console.error(`Error getting message from API: ${error}`);
                            }
                        }, 600)
                    }
                }
                catch (error) {
                    console.error(`Error getting message from API: ${error}`);
                }

            }

            //close button functionality
            cancelButton.addEventListener("click", function () {
                chatBot.style.display = "flex";
                formContainer.remove();
            });
        };
    });
})(window);

