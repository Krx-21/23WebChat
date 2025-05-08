

(function connect() {
        const socket = io.connect("http://two3webchat.onrender.com/random")
        let otherUserId = null
        let messageContainer = document.getElementsByClassName("chat-list")[0]
        let groupId = ""

        const addMessage = (message, isFromOtherUser) => {
            let newMessage = document.createElement("li");

            // Create message content
            let messageContent = document.createElement("div");
            messageContent.innerHTML = message;
        
            // Create timestamp
            let timestamp = document.createElement("span");
            let now = new Date();
            timestamp.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timestamp.classList.add("block", "text-xs", "mt-1");
        
            // Apply separate styles depending on sender
            if (isFromOtherUser) {
                newMessage.setAttribute("class", "bg-gray-200 text-black p-2 rounded-lg max-w-xs mb-2 self-start");
                timestamp.classList.add("text-gray-600"); // darker text for light background
            } else {
                newMessage.setAttribute("class", "bg-blue-500 text-white p-2 rounded-lg max-w-xs mb-2 self-end");
                timestamp.classList.add("text-blue-200"); // lighter text for dark background
            }
        
            // Append content and timestamp
            newMessage.appendChild(messageContent);
            newMessage.appendChild(timestamp);
        
            messageContainer.appendChild(newMessage);
            
            if(messageContainer.clientHeight >= (window.innerHeight / 100) * 80){
                let container = document.getElementsByClassName("chat-container")[0]
                container.scrollTop = container.scrollHeight - container.clientHeight
            }                
        }

        const startChatting = () => {
            document.getElementsByClassName("chat-container")[0].style.display = "flex"
            document.getElementsByClassName("no-other-user")[0].style.display = "none"
            document.getElementsByClassName("message-input")[0].addEventListener("keyup", event => {
                if(event.keyCode === 13){
                    document.getElementsByClassName("send-message-btn")[0].click()
                }
            })
            document.getElementsByClassName("message-input")[0].addEventListener("focus", () => {
                let container = document.getElementsByClassName("chat-container")[0]
                container.scrollTop = container.scrollHeight - container.clientHeight
            })
        }

        // send message
        document.getElementsByClassName("send-message-btn")[0].addEventListener("click", () => {
            let message = document.getElementsByClassName("message-input")[0].value
            if(message.length > 0){
                if(groupId === ""){
                    socket.emit("send message", {
                        for: otherUserId,
                        message
                    })
                }
                else{
                    socket.emit("group message", {
                        groupId,
                        message,
                        from: socket.id
                    })
                }
                addMessage(message, false)
                document.getElementsByClassName("message-input")[0].value = ""
            }
        })

        

        socket.on("get other user id", data => {
            if(data.for === socket.id || data.otherUserId === socket.id){
                console.log("connected")
                otherUserId = data.for === socket.id ? data.otherUserId : data.for
                startChatting()
            }
        })

        socket.on("recieve message", data => {
            if(data.for === socket.id){
                addMessage(data.message, true)
            }
        })

        socket.on("other user disconnected", data => {
            if(data.for === socket.id){
                console.log("disconnect")
                document.getElementsByClassName("chat-container")[0].style.display = "none"
                document.getElementsByClassName("no-other-user")[0].style.display = "flex"
                document.getElementById("waiting_message").innerHTML = "คู่สนทนาคุณได้ออกจากห้อง, กำลังรอคู่สนทนาใหม่..."
                document.getElementsByTagName("ul")[0].innerHTML = ""
            }
        })

        document.getElementById("group_icon").addEventListener("click", async (event) => {
            if(groupId === ""){
                const {value: createGroup} = await Swal.fire({
                    title: "Choose action",
                    input: "radio",
                    inputOptions: {
                        "Create group": "Create group",
                        "Join group": "Join group"
                    },
                    inputValidator: (value) => {
                        if (!value) {
                            return 'You need to choose something!'
                        }
                    },
                    heightAuto: false,
                    showCancelButton: true

                })
                if(createGroup === "Join group"){
                    const {value: groupIdInput } = await Swal.fire({
                        title: 'Enter group ID',
                        input: 'text',
                        inputLabel: 'Your group ID',
                        showCancelButton: true,
                        inputValidator: (value) => {
                            if (!value) {
                                return 'You need to write something!'
                            }
                        },
                        heightAuto: false,
                    })
                    if(groupIdInput){
                        groupId = groupIdInput
                        socket.emit("Join group", {
                            groupId: groupIdInput,
                            for: socket.id
                        })
                    }
                }
                else if(createGroup === "Create group"){
                    socket.emit("Create group", {
                        owner: socket.id
                    })
                }
            }
            else{
                Swal.fire({
                    title: "Your group ID",
                    icon: "info",
                    heightAuto: false,
                    text: `${groupId}`
                })
            }
        })
        
        socket.on("Admin group id", data => {
            if(data.for === socket.id){
                groupId = data.groupId
                startChatting()
            }
        })

        socket.on("Join group resolve", data => {
            if(data.for === socket.id){
                if(data.success){
                    startChatting()
                }
                else{
                    groupId = ""
                    Swal.fire({
                        title: 'Error!',
                        text: 'Wrong group ID entered',
                        icon: 'error',
                        heightAuto: false
                    })
                }
            }
        })

        socket.on("recieve group message", data => {
            if(data.groupId === groupId){
                if(data.from !== socket.id)
                    addMessage(data.message, true)
            }
        })

})();