(function (global) {
    window.addEventListener('DOMContentLoaded', function () {
        const CHATBOT_ID = "chatBotButton";
        const CHAT_FORM_ID = "chatForm";
        let botNumber = null;
        let logo_url = "";
        let org_name = "";
        let theme_color = "";
        let intial_message = ""
        let socket;

        // Get telerivet_url from script tag
        let telerivetUrl = null;
        const scripts = document.querySelectorAll('script[src*="chatbot.js"]');
        scripts.forEach(script => {
            const url = script.getAttribute('telerivet_url');
            if (url) telerivetUrl = url;
        });

        // Add bounce animation style
        const style = document.createElement('style');
        style.innerHTML = `
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); } 
            40% { transform: scale(1); }
        }
        @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.95);
              filter: blur(4px);
            }
            100% {
               opacity: 1;
               transform: scale(1);
               filter: blur(0);
            }
        }
        @keyframes slideInUp {
             0% {
                transform: translateY(100%);
                opacity: 0;
                filter: transparent(18px);
            }
            100%  {
                transform: translateY(0);
                opacity: 1;
                filter: transparent(0px);
            }
        }
        @keyframes slideInleft{
        0% {
                transform: translateX(100%);
                opacity: 0;       
            }
        100%  {
                transform: translateX(0);
                opacity: 1; 
            }
        
        }   
        #chatBotButton {
            animation: fadeInScale 0.5s ease-out;
        }
        #chatForm {
            animation: slideInUp 1s ease-out;
        }
        .animate-slideInleft {
           animation: slideInleft 0.7s ease-out forwards;
        }
       `;
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

        async function showChatForm(data) {
            chatBot.style.display = "none";
            let formContainer = document.getElementById(CHAT_FORM_ID);
            if (formContainer) {
                formContainer.style.display = "flex";
                updateStartConvTime();
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
                borderRadius: "15px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
            });

            formContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; justify-content: space-between; background-color: ${theme_color}; color: white; border-radius: 15px 15px 2px 2px">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding:10px 12px; ">
                       <div style="display: flex; justify-content: left; align-items: center; gap:5px"> 
                        <img id="org-url" alt="Logo" style="width: 20%; height: auto; opacity: 0; transform: translateX(-20px);transition: opacity 0.6s ease, transform 0.2s ease;">
                           <div style="display: flex; flex-direction: column; gap:5px">
                           <p class="org-name" style="font-size: 25px; font-weight: 600;"></p>
                             <p style="font-size: 13px; color: rgb(255, 255, 255); opacity:0.8">AI Assistant</p> 
                            </div>
                          
                        </div>   
                        <div>
                            <span id="cancelButton" style="cursor:pointer; font-size:35px">&times;</span>
                        </div>
                    </div>  
                   
                </div>
                
                <div id="chatBody" style="flex-grow: 1; width: auto; height: 40vh; min-height: 400px; max-height: 450px; display: flex; flex-direction: column; overflow-y:auto; padding: 10px;">
                    <div id="start_conv" class="bot-message" style="display: flex; flex-direction: row; align-items: flex-start; width: 95%; margin:15px 2px 2px 2px">
                        <div class="avatar" style="margin-right: 10px; margin-top:10px; border-radius: 50%; width: 35px; height: 35px; display:flex; align-items:center; justify-content: center">
                            <img alt="Bot" style="width: 50px; height: auto; transform: translateX(-40px);transition: opacity 0.6s ease, transform 0.2s ease;">
                        </div>
                        <div style="display: flex; flex-direction: column;  gap:5px;width:80%">
                           <div class="time" style="font-size: 12px; color: #919799" ></div>
                            <div class="message-container" style="padding = 10px; borderRadius =2px 10px 10px 10px";>
                                <div id ="initial_message" style="padding: 5px; ">${intial_message}</div>
                            </div>
                            <button id ="intial_buttons" class="chat-option" data-response="" style="border:none; background-color:transparent ; padding: 8px 12px; cursor: pointer; border-radius: 10px; color: ${theme_color}; width: 100%; margin-top: 8px"></button>
                        </div> 
                    </div>
                </div>
                <div id="sendDiv" style="background-color: white; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding: 10px; display: none ;gap:10px">
                    <div id="home" style="cursor: pointer; ">
                        <img src="https://example-chatapp.vercel.app/photos/home.png" style="width: 30px; height: 30px;" />
                    </div>
                    <input id="input" type="text" autocomplete="off" placeholder ="Write your message" value =""
                        style="flex: 1; padding: 10px 15px 10px 15px; border: 1px solid #ccc; border-radius: 10px; outline: none; " value=""/>
                    <button id="sendButton"
                        style="padding: 10px 10px; background-color: ${theme_color}; color: white; border: none; border-radius: 5px; cursor: pointer;">Send</button>

                   
                </div>
                <div style ="display:flex; justify-content:center; align-items:center; padding:5px ;gap:5px">
                <p style="text-align: center; color: #aab0b8; font-size: 12px">Powered by Telerivet</p>
                <span style="border: 1px solid #e0dede; height:10px"></span>
                 <a href="https://www.telerivet.com/" target="_blank" style="text-decoration: none ; width: 15px; height: 15px;">  <img src="https://example-chatapp.vercel.app/photos/browser.png" style="width: 15px; height: 15px;" /></a>
                 </div>
                 
               
            `;
            const logoImg = formContainer.querySelector("img[alt='Logo']");
            const orgNameEl = formContainer.querySelector("p.org-name");

            // Base animation styles for both logo and org name
            if (logoImg) {
                logoImg.style.opacity = "0";
                logoImg.style.transform = "translateX(-20px)";
                logoImg.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            }

            if (orgNameEl) {
                orgNameEl.style.opacity = "0";
                orgNameEl.style.transform = "translateX(-20px)";
                orgNameEl.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                orgNameEl.textContent = org_name || "";
            }

            // Set logo image and visibility
            if (logoImg) {
                if (logo_url) {
                    logoImg.src = logo_url;
                    logoImg.style.display = "block";
                } else {
                    logoImg.style.display = "none";
                }
            }

            document.body.appendChild(formContainer);
            // updateStartConvTime();
            initChatEvents();

            // Animate both elements
            setTimeout(() => {
                if (logo_url && logoImg) {
                    logoImg.style.opacity = "1";
                    logoImg.style.transform = "translateX(0)";
                }

                if (org_name && orgNameEl) {
                    orgNameEl.style.opacity = "1";
                    orgNameEl.style.transform = "translateX(0)";
                }
            }, 100);



        }
        function updateStartConvTime() {
            const timeDiv = document.querySelector("#start_conv .time");
            if (!timeDiv) return;
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeDiv.textContent = `AI Assistant . ${timeString}`;
        }
        function initChatEvents() {
            const inputField = document.getElementById("input");
            const sendButton = document.getElementById("sendButton");
            const sendDiv = document.getElementById("sendDiv");
            const cancelButton = document.getElementById("cancelButton");
            const chatBody = document.getElementById("chatBody");
            const homeButton = document.getElementById("home");

            initWebSocket();

            sendButton.onclick = () => {
                const message = inputField.value.trim();
                if (message) {
                    appendMessage(message, "user");
                    sendBackend(message, botNumber);
                    inputField.value = "";
                }
            };

            inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendButton.click();
                }
            });


            cancelButton.onclick = () => {
                chatBot.style.display = "flex";
                document.getElementById(CHAT_FORM_ID).style.display = "none";
            };

            homeButton.onclick = () => {
                const clearElement = chatBody.querySelectorAll(".user-message, .bot-message")
                clearElement.forEach(e => e.remove())
                chatBody.scrollTop = chatBody.scrollHeight;
                sendBackend("Main menu", botNumber);

            };

            chatBody.addEventListener("click", function (e) {
                if (e.target && e.target.classList.contains("chat-option")) {
                    const response = e.target.dataset.response;
                    appendMessage(response, "user");
                    sendBackend(response, botNumber);
                    sendDiv.style.display = "flex";
                    sendDiv.style.justifyContent = "center";
                    sendDiv.style.alignItems = "center";

                    const startConv = document.getElementById("start_conv");
                    if (startConv) startConv.style.display = "none";
                }
            });
            // WebSocket Initialization & Event Handlers
            let reconnectInterval = 3000; // 3 seconds
            let reconnectAttempts = 0;
            let maxReconnectAttempts = 10;

            function initWebSocket() {
                socket = new WebSocket("wss://chatbot-backendtest.onrender.com");

                socket.onopen = () => {
                    console.log("WebSocket connected");
                    // reconnectAttempts = 0; // reset on successful connection
                    socket.send(JSON.stringify({ textMessage: "Start", number: "", telerivetUrl: telerivetUrl }));
                };

                socket.onmessage = (event) => {
                    removeTypingIndicator();
                    const data = JSON.parse(event.data);
                    console.log(data, "data from websocket");

                    if (!botNumber) {
                        botNumber = data.uniqueTestNumber;
                    }

                    if (data.type === "webhook") {
                        logo_url = data.url;
                        org_name = data.name;
                        theme_color = data.theme_color;
                        intial_message = data.intial_message;
                        buttonText = data.button

                        const logoImg = document.querySelector("#chatForm img[alt='Logo']");
                        const orgNameEl = document.querySelector("#chatForm p.org-name");
                        const initialMessageText = document.querySelector(".message-container #initial_message");
                        const initialMessageDiv = document.querySelector(".message-container");
                        const bot_image = document.querySelector(".avatar img")
                        const intial_buttons = document.querySelector("#intial_buttons")
                        const time = document.querySelector(".time")

                        // Apply base animation styles again (reset)
                        if (logoImg) {
                            logoImg.style.opacity = "0";
                            logoImg.style.transform = "translateX(-20px)";
                            logoImg.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                            time.style.opacity = "0";
                            time.style.transform = "translateX(-20px)";
                            time.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                        }

                        if (orgNameEl) {
                            orgNameEl.style.opacity = "0";
                            orgNameEl.style.transform = "translateX(-20px)";
                            orgNameEl.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                        }
                        if (initialMessageDiv) {
                            initialMessageDiv.style.opacity = "0";
                            initialMessageDiv.style.transform = "translateX(20px)";
                            initialMessageDiv.style.backgroundColor = "#EBEEF1"
                            initialMessageDiv.style.transition = "opacity 0.6s ease, transform 0.6s ease";


                        }
                        if (bot_image) {
                            bot_image.style.opacity = "0"
                            bot_image.style.transform = "translateX(-20px)";
                            bot_image.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                        }
                        if (intial_buttons) {
                            intial_buttons.style.opacity = "0"
                            intial_buttons.style.transform = "translateX(-20px)";
                            intial_buttons.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                            intial_buttons.style.border = `1px solid ${theme_color}`
                            intial_buttons.style.backgroundColor = "transparent"
                            intial_buttons.style.color = `${theme_color}`
                        }

                        // Update content
                        if (logo_url) {
                            logoImg.src = logo_url;
                            logoImg.style.display = "block";
                            bot_image.src = logo_url
                            bot_image.style.display = "block"
                            updateStartConvTime();

                        } else {
                            logoImg.style.display = "none";
                            bot_image.style.display = "none"
                        }

                        if (orgNameEl) {
                            orgNameEl.textContent = org_name || "";
                        }
                        if (intial_message) {
                            initialMessageText.textContent = intial_message
                        }
                        if (intial_buttons) {
                            intial_buttons.textContent = buttonText;
                            intial_buttons.setAttribute("data-response", buttonText)
                        }

                        function applyThemeColor(theme_color) {
                            const header = document.querySelector("#chatForm > div:first-child");
                            const sendBtn = document.getElementById("sendButton");
                            const buttons = document.querySelectorAll(".chat-option");

                            if (header) header.style.backgroundColor = theme_color;
                            if (sendBtn) sendBtn.style.backgroundColor = theme_color;

                            buttons.forEach(btn => {
                                btn.style.borderColor = theme_color;
                                btn.style.color = theme_color;
                            });
                        }

                        if (theme_color) {
                            applyThemeColor(theme_color)
                        }


                        // Animate in again
                        setTimeout(() => {
                            if (logo_url && logoImg) {
                                logoImg.style.opacity = "1";
                                logoImg.style.transform = "translateX(0)";
                                time.style.opacity = "1";
                                time.style.transform = "translateX(0px)";
                            }

                            if (org_name && orgNameEl) {
                                orgNameEl.style.opacity = "1";
                                orgNameEl.style.transform = "translateX(0)";
                            }
                            if (initialMessageDiv && intial_message) {
                                initialMessageDiv.style.opacity = "1";
                                initialMessageDiv.style.transform = "translateX(0)";
                                initialMessageDiv.style.backgroundColor = "#EBEEF1"
                                initialMessageDiv.style.padding = "10px";
                                initialMessageDiv.style.borderRadius = "2px 10px 10px 10px";
                            }
                            if (logo_url && bot_image) {
                                bot_image.style.opacity = "1";
                                bot_image.style.transform = "translateX(0)";
                            }
                            if (intial_buttons && buttonText) {
                                intial_buttons.style.opacity = "1"
                                intial_buttons.style.transform = "translateX(0px)";
                                intial_buttons.style.border = `1px solid ${theme_color}`
                                intial_buttons.style.color = `${theme_color}`
                            }
                        }, 100);

                    }

                    if (data.type === "incoming") {
                        let botMsg = data.message;
                        let messageContent = botMsg.content || "";

                        if (botMsg.media) {
                            const mediaHtml = `<a href="${botMsg.media}" target="_blank"><img src="${botMsg.media}" alt="Image" style="max-width: 100%; border-radius: 10px; margin-bottom: 10px;"></a>`;
                            messageContent = `${mediaHtml}${messageContent}`;
                        }

                        if (botMsg.url) {
                            const linkHtml = `<a href="${botMsg.url}" target="_blank" style="text-decoration: none;">${botMsg.url}</a>`;
                            messageContent += `<div style="margin-top:10px;">${linkHtml}</div>`;
                        }

                        if (botMsg.quick_replies?.some(q => Object.keys(q).length)) {
                            console.log(botMsg.quick_replies, "replies")
                            const buttonHtml = botMsg.quick_replies.map(button => {
                                return `<button class="chat-option" data-response="${button.text}" style="border: 1px solid ${theme_color}; background-color: transparent; padding:8px 12px; cursor:pointer; border-radius:10px; color: ${theme_color}; margin: 5px 5px 0 0; width:100%">${button.text}</button>`;
                            }).join("");
                            messageContent += `<div style="margin-top:10px;">${buttonHtml}</div>`;
                        }

                        appendMessage({ botMessage: messageContent }, "bot");
                    }
                };

                socket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };

                socket.onclose = (event) => {
                    console.warn("WebSocket closed:", event.reason);
                    // attemptReconnect();
                };
            }
            function attemptReconnect() {
                if (reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
                    setTimeout(() => {
                        initWebSocket();
                    }, reconnectInterval);
                } else {
                    console.error("Max reconnect attempts reached. Could not reconnect WebSocket.");
                }
            }


            function sendBackend(message, number) {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    showTypingIndicator();
                    const payload = JSON.stringify({
                        textMessage: message,
                        number: number,
                        telerivetUrl: telerivetUrl
                    });
                    socket.send(payload);
                } else {
                    console.warn("WebSocket not connected. Cannot send message.");
                }
            }


            function appendMessage(message, sender) {
                const chatBody = document.getElementById("chatBody");
                if (!chatBody) return;
                const messageDiv = document.createElement("div");
                messageDiv.className = sender === "bot" ? "bot-message" : "user-message";
                messageDiv.style.display = "flex";
                messageDiv.style.flexDirection = "row";
                messageDiv.style.alignItems = "flex-start";
                messageDiv.style.marginBottom = "30px";
                messageDiv.style.width = sender === "bot" ? "95%" : "100%";
                messageDiv.style.justifyContent = sender === "bot" ? "flex-start" : "flex-end";

                const messageWrapper = document.createElement("div");
                messageWrapper.style.display = "flex";
                messageWrapper.style.flexDirection = "column";
                messageWrapper.style.alignItems = sender === "bot" ? "flex-start" : "flex-end";
                messageWrapper.style.maxWidth = "80%";
                messageWrapper.style.gap = "5px";

                const timeWrapper = document.createElement("div");
                timeWrapper.className = "time";
                timeWrapper.style.fontSize = "12px";
                timeWrapper.style.color = "#919799"
                const now = new Date();
                const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLocaleLowerCase();
                timeWrapper.innerHTML = sender === "bot" ? `AI Assistant. ${timeString}` : timeString

                const messageBubble = document.createElement("div");
                messageBubble.style.backgroundColor = sender === "bot" ? "#EBEEF1" : theme_color;
                messageBubble.style.color = sender === "bot" ? "black" : "white";
                messageBubble.style.padding = "10px";
                messageBubble.style.borderRadius = sender === "bot" ? "2px 10px 10px 10px" : "10px 2px 10px 10px"
                messageBubble.style.minWidth = "100%";

                if (sender === "bot") {
                    const [msgOnly, ...buttonParts] = message.botMessage.split(/(?=<button)/);
                    messageBubble.innerHTML = msgOnly.trim();
                    messageWrapper.appendChild(timeWrapper)
                    messageWrapper.appendChild(messageBubble);


                    const avatar = document.createElement("div");
                    avatar.className = "avatar";
                    avatar.style.margin = sender === "bot" ? "10px 10px 0 0" : "";
                    avatar.style.borderRadius = "50%";
                    avatar.style.width = sender === "bot" ? "35px" : "30px";
                    avatar.style.height = sender === "bot" ? "35px" : "30px";
                    avatar.style.display = "flex";
                    avatar.style.alignItems = "center";
                    avatar.style.justifyContent = "center";
                    avatar.innerHTML = `<img src=${logo_url}  alt='Bot' style="width: 50px; height: auto; border-radius: 50%;">`
                    if (buttonParts.length) {
                        const buttonWrapper = document.createElement("div");
                        buttonWrapper.style.display = "flex";
                        buttonWrapper.style.flexWrap = "wrap";
                        buttonWrapper.style.marginTop = "5px";
                        buttonWrapper.style.width = "100%"
                        buttonWrapper.innerHTML = buttonParts.join("");
                        messageWrapper.appendChild(buttonWrapper);
                    }

                    messageDiv.appendChild(avatar);
                    messageDiv.appendChild(messageWrapper);
                } else {
                    messageBubble.innerHTML = message;
                    messageWrapper.appendChild(timeWrapper)
                    messageWrapper.appendChild(messageBubble);
                    messageDiv.appendChild(messageWrapper);
                    // messageDiv.appendChild(avatar);
                }

                chatBody.appendChild(messageDiv);
                chatBody.scrollTop = chatBody.scrollHeight;
            }


            function showTypingIndicator() {
                const typingDiv = document.createElement("div");
                typingDiv.id = "typingIndicator";
                typingDiv.style.display = "flex";
                typingDiv.style.alignItems = "center";
                typingDiv.style.marginBottom = "20px";
                typingDiv.style.marginLeft = "10px";

                typingDiv.innerHTML = `
                    <div style="display:flex; gap: 4px;">
                        <span style="width:8px; height:8px; background:${theme_color}; border-radius:50%; animation: bounce 1.2s infinite ease-in-out;"></span>
                        <span style="width:8px; height:8px; background:${theme_color}; border-radius:50%; animation: bounce 1.2s infinite ease-in-out; animation-delay: .2s;"></span>
                        <span style="width:8px; height:8px; background:${theme_color}; border-radius:50%; animation: bounce 1.2s infinite ease-in-out; animation-delay: .4s;"></span>
                    </div>
                `;
                chatBody.appendChild(typingDiv);
                chatBody.scrollTop = chatBody.scrollHeight;
            }

            function removeTypingIndicator() {
                const typing = document.getElementById("typingIndicator");
                if (typing) typing.remove();
            }
        }
    });
})(window);
