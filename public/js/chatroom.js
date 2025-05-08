

(function connect() {
    let socket = io.connect("http://two3webchat.onrender.com")
    let normalrooms = io.connect("http://two3webchat.onrender.com/nmroom")

    let username = document.querySelector('#username');
    let usernameBtn = document.querySelector('#usernameBtn');
    let curUsername = document.querySelector('.changename');

    usernameBtn.addEventListener('click', e => {
        socket.emit('change_username', { username: username.value })
        curUsername.textContent = username.value 
        username.value = ''
    }) 

    let message = document.querySelector('#message');
    let messageBtn = document.querySelector('#messageBtn');
    let messageList = document.querySelector('#message-list');

    messageBtn.addEventListener('click', e => {
        socket.emit('new_message', { message: message.value})
        message.value = ''
    })

    socket.on('receive_message', data => {
        let listItem = document.createElement('li')
        const currentTime = new Date().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });


        // Combine time, username, and message
        listItem.innerHTML = `<span class="text-gray-500 text-sm mr-2">(${currentTime})</span> ${data.username} : ${data.message}`;
    
        listItem.classList.add('list-group-item', 'p-2', 'border-b', 'border-gray-200');

        listItem.classList.add('list-group-item');
        messageList.appendChild(listItem) 
    })

    let info = document.querySelector('.info');

    message.addEventListener('keypress', e => {
        socket.emit('typing')
    })

    socket.on('typing', data => {
        info.textContent = data.username + " กำลังพิมพ์..."
        setTimeout(() => { info.textContent = ''}, 1500)
    })
    
})();