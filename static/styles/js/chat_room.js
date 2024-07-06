
(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        global.ReconnectingWebSocket = factory();
    }
})(this, function () {

    if (!('WebSocket' in window)) {
        return;
    }

    function ReconnectingWebSocket(url, protocols, options) {

        // Default settings
        var settings = {

            /** Whether this instance should log debug messages. */
            debug: false,

            /** Whether or not the websocket should attempt to connect immediately upon instantiation. */
            automaticOpen: true,

            /** The number of milliseconds to delay before attempting to reconnect. */
            reconnectInterval: 1000,
            /** The maximum number of milliseconds to delay a reconnection attempt. */
            maxReconnectInterval: 30000,
            /** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
            reconnectDecay: 1.5,

            /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
            timeoutInterval: 2000,

            /** The maximum number of reconnection attempts to make. Unlimited if null. */
            maxReconnectAttempts: null,

            /** The binary type, possible values 'blob' or 'arraybuffer', default 'blob'. */
            binaryType: 'blob'
        }
        if (!options) { options = {}; }

        // Overwrite and define settings with options if they exist.
        for (var key in settings) {
            if (typeof options[key] !== 'undefined') {
                this[key] = options[key];
            } else {
                this[key] = settings[key];
            }
        }

        // These should be treated as read-only properties

        /** The URL as resolved by the constructor. This is always an absolute URL. Read only. */
        this.url = url;

        /** The number of attempted reconnects since starting, or the last successful connection. Read only. */
        this.reconnectAttempts = 0;

        /**
         * The current state of the connection.
         * Can be one of: WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
         * Read only.
         */
        this.readyState = WebSocket.CONNECTING;

        /**
         * A string indicating the name of the sub-protocol the server selected; this will be one of
         * the strings specified in the protocols parameter when creating the WebSocket object.
         * Read only.
         */
        this.protocol = null;

        // Private state variables

        var self = this;
        var ws;
        var forcedClose = false;
        var timedOut = false;
        var eventTarget = document.createElement('div');

        // Wire up "on*" properties as event handlers

        eventTarget.addEventListener('open', function (event) { self.onopen(event); });
        eventTarget.addEventListener('close', function (event) { self.onclose(event); });
        eventTarget.addEventListener('connecting', function (event) { self.onconnecting(event); });
        eventTarget.addEventListener('message', function (event) { self.onmessage(event); });
        eventTarget.addEventListener('error', function (event) { self.onerror(event); });

        // Expose the API required by EventTarget

        this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
        this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
        this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);

        /**
         * This function generates an event that is compatible with standard
         * compliant browsers and IE9 - IE11
         *
         * This will prevent the error:
         * Object doesn't support this action
         *
         * http://stackoverflow.com/questions/19345392/why-arent-my-parameters-getting-passed-through-to-a-dispatched-event/19345563#19345563
         * @param s String The name that the event should use
         * @param args Object an optional object that the event will use
         */
        function generateEvent(s, args) {
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(s, false, false, args);
            return evt;
        };

        this.open = function (reconnectAttempt) {
            ws = new WebSocket(self.url, protocols || []);
            ws.binaryType = this.binaryType;

            if (reconnectAttempt) {
                if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
                    return;
                }
            } else {
                eventTarget.dispatchEvent(generateEvent('connecting'));
                this.reconnectAttempts = 0;
            }

            if (self.debug || ReconnectingWebSocket.debugAll) {
                console.debug('ReconnectingWebSocket', 'attempt-connect', self.url);
            }

            var localWs = ws;
            var timeout = setTimeout(function () {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'connection-timeout', self.url);
                }
                timedOut = true;
                localWs.close();
                timedOut = false;
            }, self.timeoutInterval);

            ws.onopen = function (event) {
                clearTimeout(timeout);
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onopen', self.url);
                }
                self.protocol = ws.protocol;
                self.readyState = WebSocket.OPEN;
                self.reconnectAttempts = 0;
                var e = generateEvent('open');
                e.isReconnect = reconnectAttempt;
                reconnectAttempt = false;
                eventTarget.dispatchEvent(e);
            };

            ws.onclose = function (event) {
                clearTimeout(timeout);
                ws = null;
                if (forcedClose) {
                    self.readyState = WebSocket.CLOSED;
                    eventTarget.dispatchEvent(generateEvent('close'));
                } else {
                    self.readyState = WebSocket.CONNECTING;
                    var e = generateEvent('connecting');
                    e.code = event.code;
                    e.reason = event.reason;
                    e.wasClean = event.wasClean;
                    eventTarget.dispatchEvent(e);
                    if (!reconnectAttempt && !timedOut) {
                        if (self.debug || ReconnectingWebSocket.debugAll) {
                            console.debug('ReconnectingWebSocket', 'onclose', self.url);
                        }
                        eventTarget.dispatchEvent(generateEvent('close'));
                    }

                    var timeout = self.reconnectInterval * Math.pow(self.reconnectDecay, self.reconnectAttempts);
                    setTimeout(function () {
                        self.reconnectAttempts++;
                        self.open(true);
                    }, timeout > self.maxReconnectInterval ? self.maxReconnectInterval : timeout);
                }
            };
            ws.onmessage = function (event) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onmessage', self.url, event.data);
                }
                var e = generateEvent('message');
                e.data = event.data;
                eventTarget.dispatchEvent(e);
            };
            ws.onerror = function (event) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onerror', self.url, event);
                }
                eventTarget.dispatchEvent(generateEvent('error'));
            };
        }

        // Whether or not to create a websocket upon instantiation
        if (this.automaticOpen == true) {
            this.open(false);
        }

        /**
         * Transmits data to the server over the WebSocket connection.
         *
         * @param data a text string, ArrayBuffer or Blob to send to the server.
         */
        this.send = function (data) {
            if (ws) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'send', self.url, data);
                }
                return ws.send(data);
            } else {
                throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
            }
        };

        /**
         * Closes the WebSocket connection or connection attempt, if any.
         * If the connection is already CLOSED, this method does nothing.
         */
        this.close = function (code, reason) {
            // Default CLOSE_NORMAL code
            if (typeof code == 'undefined') {
                code = 1000;
            }
            forcedClose = true;
            if (ws) {
                ws.close(code, reason);
            }
        };

        /**
         * Additional public API method to refresh the connection if still open (close, re-open).
         * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
         */
        this.refresh = function () {
            if (ws) {
                ws.close();
            }
        };
    }

    /**
     * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
     * this indicates that the connection is ready to send and receive data.
     */
    ReconnectingWebSocket.prototype.onopen = function (event) { };
    /** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
    ReconnectingWebSocket.prototype.onclose = function (event) { };
    /** An event listener to be called when a connection begins being attempted. */
    ReconnectingWebSocket.prototype.onconnecting = function (event) { };
    /** An event listener to be called when a message is received from the server. */
    ReconnectingWebSocket.prototype.onmessage = function (event) { };
    /** An event listener to be called when an error occurs. */
    ReconnectingWebSocket.prototype.onerror = function (event) { };

    /**
     * Whether all instances of ReconnectingWebSocket should log debug messages.
     * Setting this to true is the equivalent of setting all instances of ReconnectingWebSocket.debug to true.
     */
    ReconnectingWebSocket.debugAll = false;

    ReconnectingWebSocket.CONNECTING = WebSocket.CONNECTING;
    ReconnectingWebSocket.OPEN = WebSocket.OPEN;
    ReconnectingWebSocket.CLOSING = WebSocket.CLOSING;
    ReconnectingWebSocket.CLOSED = WebSocket.CLOSED;

    return ReconnectingWebSocket;
});





function formatTimesince(dateTimeString) {
    // Parse the date-time string from JSON
    const dateTime = new Date(dateTimeString);

    // Get the current date and time
    const now = new Date();

    // Calculate the difference in milliseconds
    const difference = now.getTime() - dateTime.getTime();

    // Handle different time ranges
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    // Define labels for each time unit
    const labels = {
        'years': ' year',
        'months': ' month',
        'days': ' day',
        'hours': ' hour',
        'minutes': ' min',
        'seconds': ' second',
        'ago': ' ago',
    };

    // Choose the appropriate time unit based on difference
    if (years > 0) {
        return `${years}${labels.years}${years === 1 ? '' : 's'}${labels.ago}`;
    } else if (months > 0) {
        return `${months}${labels.months}${months === 1 ? '' : 's'}${labels.ago}`;
    } else if (days > 0) {
        return `${days}${labels.days}${days === 1 ? '' : 's'}${labels.ago}`;
    } else if (hours > 0) {
        return `${hours}${labels.hours}${hours === 1 ? '' : 's'}${labels.ago}`;
    } else if (minutes > 0) {
        return `${minutes}${labels.minutes}${minutes === 1 ? '' : 's'}${labels.ago}`;
    } else {
        return `just now`; // Handle seconds or less as "just now"
    }
}




function createReplyElements(replyData) {
    const replyContainer = document.createElement('div'); // Container for all replies

    for (const reply of replyData) {
        const replyElement = document.createElement('div');
        // const reply_uuid = crypto.randomUUID();
        // replyElement.setAttribute('id', reply_uuid)
        replyElement.setAttribute('id', 'response-to-a-message')
        replyElement.classList.add('response-to-a-message');

        // Assuming you have functions for user profile URL and username formatting
        const replyImageUrl = reply.reply_user_image;
        const replyUsername = reply.reply_user_firstname  // Handle missing username
        // user_reply_link_href_url = "http://127.0.0.1:8000/epsu_members/member-profile/" + reply.reply_user_id
        user_reply_link_href_url = base_url + "epsu_members/member-profile/" + reply.reply_user_id


        // Build the HTML structure using template literals for cleaner concatenation
        replyElement.innerHTML = `
        <span class="host-image-username" id="host-image-username">
          <div class="host-user-image-container"> 
            <a href="${user_reply_link_href_url}" class="reply-personality">
              <img src="${replyImageUrl}" alt="image" class="room-host-image">
              <h5 class="">${replyUsername}</h5>
            </a>
          </div>
          <p class="replied">replied..</p>
          <p>${formatTimesince(reply.created)}</p>
          <div class="flexing-reply-icons" id="flexing-reply-icons">
          <i class="ri-file-edit-line del"></i>
          <i class="ri-delete-bin-6-line del"></i>
          </div>
        </span>
        <p class="message-body">${reply.body}</p>
      `;

        replyContainer.appendChild(replyElement);


    }

    return replyContainer;
}


// THE CODE BELOW IS RESPONSIBLE FOR MAKING THE CHAT MOVE TO THE VERY BOTTOM WHEN THE BOTTOM ARROW IS PRESSED

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-box');
    const scrollButton = document.getElementById('scrollButton');

    // Function to scroll to the bottom
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Event listener for the scroll button
    scrollButton.addEventListener('click', scrollToBottom);

    // Show the button when the chat is not at the bottom
    chatContainer.addEventListener('scroll', () => {
        if (chatContainer.scrollTop + chatContainer.clientHeight < chatContainer.scrollHeight) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    });

    // Initially scroll to the bottom
    scrollToBottom();
});





// THIS JS CODE IS FOR TAKING FILES FROM USERS
const imgPreview = document.getElementById("img-preview");
// Remove the element from the DOM


// THE BELOW JAVASCRIPTS CODE IS THE CODE THAT IS GOING TO HANDLE WEBSOCKET AND ASYNCHRONOUS COMMUNICATION WITH THE SERVER
// const roomId = 'dave'; REMEMBER YOU WERE USING THE ID OF THE OF CHATROOM AND IT HAS SHOWN YOU SHEGE WITH AN ERROR YOU HAVE TO DEBUG FOR HOURS.
const room_unique_string = JSON.parse(document.getElementById('room-name').textContent);
const roomid = JSON.parse(document.getElementById('room-id').textContent);
const username = JSON.parse(document.getElementById('chatter-username').textContent);
const base_url = JSON.parse(document.getElementById('base_url').textContent);
let isEditing = false;
let isreplyToMesasage = false;
var edited_message_id = null;
var replied_message_id = null;

// var ws_scheme = window.location.protocol === 'https' ? 'wss' : 'ws';
// ws_scheme +

const chatSocket = new ReconnectingWebSocket(
    'wss://'
    + window.location.host
    + '/ws/church-chat-room/'
    + room_unique_string
    + '/'
);


chatSocket.onmessage = function (e) {
    var data = JSON.parse(e.data);
    console.log(data)

    var command = data['command'];
    // if (data['elementId']){
    //     var the_delete_elementId = data['elementId']; THIS IS THE CODE YOU TRIED TO USE TO SOLVE THAT ISSUE WHERE A DELETED MESSAGE MAKES THE ENTIRE CHAT BOX TO REFRESH AND THEN YOU PASSED AS AN ARGUMENT TO THE createMessage Funct to be handled in there
    // }

    if (command === 'new_message') { // Check for the correct message type
        var data = data['message'];
        createMessage(data, command)

    }
    else if (command === 'messages') {
        const chatBox = document.getElementById('chat-box');
        if (chatBox.hasChildNodes) {
            chatBox.innerHTML = '';
        }
        var data = data['messages'];
        for (let i = 0; i < data.length; i++) {
            createMessage(data[i], command); 
        }

        // THE CODE BELOW HIDES THE PRELOADER WHEN THE MESSAGES FIRST LOAD
        const preloader = document.getElementById("preloader");
        preloader.style.display = "none"; 
    }
    else if (command == 'edit_message') {
        var data = data['message'];
        if (username === data.chatter_username) {
            const messageToEdit = document.getElementById('card_response_edit');
            const createEditParagraph = document.createElement('p');
            if (createEditParagraph.innerHTML === '') {
                create_new_question = document.createElement('p');
                create_new_question.innerHTML = 'Edit the Message: '
                messageToEdit.appendChild(create_new_question);
            }
            createEditParagraph.innerHTML = data.message_body;
            createEditParagraph.setAttribute('id', 'paragraph-for-edit');
            messageToEdit.append(createEditParagraph);
            const buttons_container = document.createElement('div');
            buttons_container.classList.add('flex-edit-and-back-btn');
            const btn1 = document.createElement('p');
            btn1.classList.add('style-btn');
            btn1.innerHTML = 'Edit';
            const btn2 = document.createElement('p');
            btn2.classList.add('style-btn');
            btn2.innerHTML = 'Back';
            buttons_container.appendChild(btn1);
            buttons_container.appendChild(btn2);
            messageToEdit.appendChild(buttons_container);
            messageToEdit.classList.toggle('show');

            btn1.setAttribute('id', 'edit_button_id');
            btn2.setAttribute('id', 'back_button_id');

            const checkEditBtn = document.getElementById('edit_button_id');
            const checkBackBtn = document.getElementById('back_button_id');

            checkEditBtn.addEventListener('click', () => {
                inputInput = document.getElementById('myTextarea');
                inputInput.value = data.message_body;
                inputInput.style.height = '80px';
                isEditing = true;
                const cardResponseEdit = document.getElementById('card_response_edit');
                document.getElementById('paragraph-for-edit').innerHTML = '';
                cardResponseEdit.classList.toggle('show');
                edited_message_id = data.message_id;

            });

            checkBackBtn.addEventListener('click', () => {
                const cardResponseEdit = document.getElementById('card_response_edit');
                document.getElementById('paragraph-for-edit').innerHTML = '';
                cardResponseEdit.classList.toggle('show');
            });
        }


    } else if (command === 'edited_message') {
        var data = data['message'];
        const createNewPelement = document.getElementById(data.message_id);
        createNewPelement.textContent = data.message_body;

    } else if (command === 'delete_message') {
        var elementId = data['elementId'];
        var data = data['message']

        if (username === data.chatter_username) {
            const messageToDelete = document.getElementById('card_response_delete');
            const createDeleteParagraph = document.createElement('p');
            if (createDeleteParagraph.innerHTML === '') {
                create_new_question = document.createElement('p');
                create_new_question.innerHTML = 'Delete the Message: '
                messageToDelete.appendChild(create_new_question);
            }
            createDeleteParagraph.innerHTML = data.message_body;
            createDeleteParagraph.setAttribute('id', 'paragraph-for-delete');
            messageToDelete.append(createDeleteParagraph);
            const buttons_container1 = document.createElement('div');
            buttons_container1.classList.add('flex-edit-and-back-btn');
            const btn3 = document.createElement('p');
            btn3.classList.add('style-btn');
            btn3.innerHTML = 'Delete';
            const btn4 = document.createElement('p');
            btn4.classList.add('style-btn');
            btn4.innerHTML = 'Back';
            buttons_container1.appendChild(btn3);
            buttons_container1.appendChild(btn4);
            messageToDelete.appendChild(buttons_container1);
            messageToDelete.classList.toggle('show');

            btn3.setAttribute('id', 'delete_button_id');
            btn4.setAttribute('id', 'delete_back_button_id');

            const checkDeleteBtn = document.getElementById('delete_button_id');
            const checkBackBtnfordelete = document.getElementById('delete_back_button_id');

            checkDeleteBtn.addEventListener('click', () => {
                is_deleted_message = true; 
                chatSocket.send(JSON.stringify({
                    'messageId': data.message_id,
                    'command': 'deleted_Message',
                    'elementId': elementId,
                    'roomid': roomid,
                }));
                // davedave
                const cardResponseDelete = document.getElementById('card_response_delete');
                document.getElementById('paragraph-for-delete').innerHTML = '';
                cardResponseDelete.classList.toggle('show');
            });

            checkBackBtnfordelete.addEventListener('click', () => {
                const cardResponseDelete = document.getElementById('card_response_delete');
                document.getElementById('paragraph-for-delete').innerHTML = '';
                cardResponseDelete.classList.toggle('show');
            });
        }


    } //else if (command === 'deleted_message') {  THIS VERY CODE WAS WHAT I WAS USING TO DELETE A REPLY BASED ON A RANDOMBLY GENERATED UUID
    //     var elementId = data['elementId'];       BUT THE PROBLEM IS THAT, THE MESSAGE IS ONLY BEEN DELETED IN THE SENDERS CHAT BOX AND NOT FOR ALL
    //     console.log(elementId)                   I LATER ON FOUND OUT THAT I NEED TO BROADCAST THE MESSAGE THROUGH THE SEND_CHAT_MESSAGE AND IT WORKED
    //     console.log('THis is supposed to be the last transmission');
    //     var data = data['message'];
    //     const deleteMessageElement = document.getElementById(elementId);
    //     if (deleteMessageElement) {
    //         deleteMessageElement.remove();
    //     } else {
    //         console.error(`Element with ID "${elementId}" not found.`); // Or provide user feedback
    //     }

    // } 
    else if (command === 'reply_message') {
        // var elementId = data['elementId'];
        var data = data['message'];
        console.log(username !== data.chatter_username)

        if (username !== data.chatter_username) {

            const messageToReply = document.getElementById('card_response_reply');

            if (messageToReply.hasChildNodes()) {
                messageToReply.innerHTML = '';
            }
            const createReplyteParagraph = document.createElement('p');
            if (createReplyteParagraph.innerHTML === '') {
                create_new_question = document.createElement('p');
                create_new_question.setAttribute('id', 'davedave')
                create_new_question.innerHTML = 'Reply to: ' + data.chatter_firstname;
                messageToReply.appendChild(create_new_question);
            }
            createReplyteParagraph.innerHTML = data.message_body;
            createReplyteParagraph.setAttribute('id', 'paragraph-for-reply');
            messageToReply.append(createReplyteParagraph);
            const buttons_cont = document.createElement('div');
            buttons_cont.classList.add('flex-edit-and-back-btn');
            const btnreply1 = document.createElement('p');
            btnreply1.classList.add('style-btn');
            btnreply1.innerHTML = 'Reply';
            const btnreply2 = document.createElement('p');
            btnreply2.classList.add('style-btn');
            btnreply2.innerHTML = 'Back';
            buttons_cont.appendChild(btnreply1);
            buttons_cont.appendChild(btnreply2);
            messageToReply.appendChild(buttons_cont);
            messageToReply.classList.toggle('show');

            btnreply1.setAttribute('id', 'reply_button_id');
            btnreply2.setAttribute('id', 'reply_back_button_id');

            const checkReplyBtn = document.getElementById('reply_button_id');
            const checkBackBtnforReply = document.getElementById('reply_back_button_id');

            checkReplyBtn.addEventListener('click', () => {
                inputInput = document.getElementById('myTextarea');
                // inputInput.value = data.message_body;
                inputInput.style.height = "65px";
                inputInput.style.fontSize = "16px";
                inputInput.focus();
                msg1 = 'Reply to';
                msg2 = "'s  messsage..."
                inputInput.placeholder = `${msg1} ${data.chatter_firstname}${msg2}`;
                isreplyToMesasage = true;
                const cardResponseReply = document.getElementById('card_response_reply');
                document.getElementById('paragraph-for-reply').innerHTML = '';
                document.getElementById('davedave').remove();
                cardResponseReply.classList.toggle('show');
                replied_message_id = data.message_id;

            });

            checkBackBtnforReply.addEventListener('click', () => {
                const cardResponseReply = document.getElementById('card_response_reply');
                document.getElementById('paragraph-for-reply').innerHTML = '';
                buttons_cont.remove();
                document.getElementById('davedave').remove();
                document.getElementById('paragraph-for-reply').remove();
                cardResponseReply.classList.toggle('show');
            });
        }

    } else if (command === "browse_topic_results"){
        
        const loopContainer = document.getElementById('loop-container');
        var check = false;


       function update_topics (data){
        if (loopContainer.childNodes.length > 0) {
            loopContainer.replaceChildren();
            check = true;
        } 
        
        for (const topic of data) {
            const roomLink = document.createElement('a');
            roomLink.href = `${base_url}CHAT_ROOM/church-chat-room/${topic.id}`; 
            // roomLink.addEventListener('click', function(event) { // WE WILL COME FOR AN UPGRADE, THAT WILL BE THE LOVE SANCTUARY VERSION 2.0WHERE WE GONNA MAKE ASYNCHRONOUS
            //     event.preventDefault();                          // COMMUNICATION WITH THE SERVER WHEN THE USER TAPS ON A ROOM HE WISHES TO JOIN AFTER SEARCH
            //     // Your custom logic here dave dave
            //     console.log("Link clicked:", link.href);
            //     });
            const hostAndTopic = document.createElement('div');
            hostAndTopic.setAttribute('class', 'host-and-topic'); // Use 'class' instead of 'id'
            
            const theP = document.createElement('p');
            theP.textContent = topic.topic;
    
            const theH5 = document.createElement('h5');
            const theSpan = document.createElement('span');
            theSpan.innerHTML = 'Host: ';
            theH5.appendChild(theSpan);
            theH5.innerHTML += `${topic.name}`;
    
            hostAndTopic.appendChild(theP);
            hostAndTopic.appendChild(theH5);
            
            roomLink.appendChild(hostAndTopic);
            loopContainer.appendChild(roomLink);

        }
    }

       update_topics (data['results']);
        
    }else if (command === "browse_topic_results_desktop"){
        
        const loopContainerDesktop = document.getElementById('loop-container-for-desktop');
        var check = false;


       function update_topicsDescktop (data){
        if (loopContainerDesktop.childNodes.length > 0) {
            loopContainerDesktop.replaceChildren();
            console.log("The parent element has child elements.");
            check = true;
        } 
        
        for (const topic of data) {
            const roomLink = document.createElement('a');
            roomLink.href = `${base_url}CHAT_ROOM/church-chat-room/${topic.id}`; // Assuming URL pattern

            const hostAndTopicDesktop = document.createElement('div');
            hostAndTopicDesktop.setAttribute('class', 'host-and-topic'); // Use 'class' instead of 'id'
            
            const theP = document.createElement('p');
            theP.textContent = topic.topic;
    
            const theH5 = document.createElement('h5');
            const theSpan = document.createElement('span');
            theSpan.innerHTML = 'Host: ';
            theH5.appendChild(theSpan);
            theH5.innerHTML += `${topic.name}`;
    
            hostAndTopicDesktop.appendChild(theP);
            hostAndTopicDesktop.appendChild(theH5);
    
            roomLink.appendChild(hostAndTopicDesktop);
            loopContainerDesktop.appendChild(roomLink);

        }
    }

       update_topicsDescktop (data['results']);
        
    }


};


// function editMessage(messageId, roomId) {
//     const editDeleteDiv = document.createElement('div');
//     editDeleteDiv.classList.add('flexing-the-del-and-edit-icon');

//     const link = document.createElement('a');
//     link.href = "#";
//     link.classList.add('edit-message-link'); 
//     link.innerHTML = '<i class="ri-file-edit-line del"></i>'; 

//     link.addEventListener('click', (event) => {
//       event.preventDefault();

//       console.log('Edit icon clicked! Message ID:', messageId, 'Room ID:', roomId);
//       //   sendMessageToServer(messageId, roomId); // Send data to server (explained later)
//     });
//     // Append the link to the desired container element (replace with your selector)
//     console.log('THIS IS DAVE THE CEO 5555!!');
//     document.getElementById('edit-container').appendChild(link);

//   }




function createMessage(data, command) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat-message-container');
    const uuid = 'message-container-new';
    messageContainer.setAttribute('id', uuid);


    // Create the chater-info section const uuid = crypto.randomUUID();
    const chaterInfo = document.createElement('div');
    chaterInfo.classList.add('chater-info');

    const hostImageUsername = document.createElement('span');
    hostImageUsername.classList.add('host-image-username');

    const hostUserImageContainer = document.createElement('div');
    hostUserImageContainer.classList.add('host-user-image-container');

    const hostImageLink = document.createElement('a');
    hostImageLink.classList.add('reply-personality');
    hostImageLink.href = base_url + "epsu_members/member-profile/" + data.user_id; // Assuming you have the user profile URL in the data


    const hostImage = document.createElement('img');
    hostImage.classList.add('room-host-image');
    var aws_host_url = 'https://epsu-knust-s3-bucket.s3.amazonaws.com/';

    hostImage.src = aws_host_url + data.user_image_url; // Assuming you have the user image URL in the data

    const hostUsername = document.createElement('h5');
    hostUsername.textContent = data.chatter_firstname; // Assuming you have the username in the data. Remeber you just maade it display the firstname rather!!!

    hostImageLink.appendChild(hostImage);
    hostImageLink.appendChild(hostUsername);

    hostUserImageContainer.appendChild(hostImageLink);
    hostImageUsername.appendChild(hostUserImageContainer)


    const messageCreatedDate = document.createElement('p');
    const formattedTime = formatTimesince(data.created);
    messageCreatedDate.textContent = formattedTime; // Assuming you have the formatted creation time in the data


    hostImageUsername.appendChild(messageCreatedDate)
    chaterInfo.appendChild(hostImageUsername);
    // hostImageUsername.appendChild(hostUserImageContainer)


    // Add edit/delete buttons if applicable (logic based on the html code original code)
    if (data.chatter_username === username) {
        const editDeleteDiv = document.createElement('div');
        editDeleteDiv.classList.add('flexing-the-del-and-edit-icon');

        function editMessage(messageId, roomId) {

            const link = document.createElement('a');
            link.href = "#";
            // link.classList.add('edit-message-link'); 
            link.innerHTML = '<i class="ri-file-edit-line del"></i>';

            link.addEventListener('click', (event) => {
                event.preventDefault();

                console.log('Edit icon clicked! Message ID:', messageId, 'Room ID:', roomId);

                const cardResponseEdit = document.getElementById('card_response_edit');
                cardResponseEdit.classList.toggle('show');

                if (cardResponseEdit.classList.contains('show')) {
                    cardResponseEdit.classList.toggle('show');
                    cardResponseEdit.innerHTML = '';
                    chatSocket.send(JSON.stringify({
                        'messageId': messageId,
                        'roomId': roomId,
                        'command': 'editMessage',
                    }));
                }

                //   sendMessageToServer(messageId, roomId); // Send data to server
            });
            editDeleteDiv.appendChild(link);

        }

        function deleteMessage(messageId, roomId, elementId) {

            const deleteLink = document.createElement('a');
            deleteLink.href = "#";
            // deleteLink.classList.add('edit-message-deleteLink'); 
            deleteLink.innerHTML = '<i class="ri-delete-bin-6-line del"></i>';

            deleteLink.addEventListener('click', (event) => {
                event.preventDefault();

                const cardResponseDelete = document.getElementById('card_response_delete');
                cardResponseDelete.classList.toggle('show');

                console.log('Have we recieved the uuid???')

                if (cardResponseDelete.classList.contains('show')) {
                    cardResponseDelete.classList.toggle('show');
                    cardResponseDelete.innerHTML = '';
                    chatSocket.send(JSON.stringify({
                        'messageId': messageId,
                        'roomId': roomId,
                        'command': 'deleteMessage',
                        'elementId': elementId,
                    }));
                }

                //   sendMessageToServer(messageId, roomId); // Send data to server
            });
            editDeleteDiv.appendChild(deleteLink);

        }

        const elementId = messageContainer.id;

        editMessage(data.message_id, roomid);
        deleteMessage(data.message_id, roomid, elementId);

        chaterInfo.appendChild(editDeleteDiv);


    } else {

        function replyMessage(messageId, roomId) {

            const link = document.createElement('a');
            link.href = "#";
            link.innerHTML = '<i class="ri-reply-all-line reply"></i>';

            link.addEventListener('click', (event) => {
                event.preventDefault();

                chatSocket.send(JSON.stringify({
                    'messageId': messageId,
                    'roomId': roomId,
                    'command': 'replyMessage',
                }));

            });
            chaterInfo.appendChild(link);

        }

        // const elementId = replyElement.id;
        replyMessage(data.message_id, roomid);

    }

    const actualMessage = document.createElement('div');
    actualMessage.classList.add('actual-message');

    const messageContent = document.createElement('div');
    messageContent.classList.add('chat-message-content');


    if (data.message_image_url) {
        const messageImage = document.createElement('img');
        messageImage.classList.add('looped-message-image');
        // messageImage.src = 'http://127.0.0.1:8000/images/' + data.message_image_url; 
        // messageImage.src = base_url + 'images/' + data.message_image_url; THIS IS CODE IS WHAT I USED TO GET THE IMAGES TO BE DISPLAYED WHEN THEY ARE BEEN STORED IN THE PROJECT FOLDER
        messageImage.src = data.message_image_url; 


        messageContent.appendChild(messageImage);
    }

    const messageBody = document.createElement('p');
    messageBody.classList.add('message-body');
    messageBody.textContent = data.message_body; 
    messageBody.setAttribute('id', data.message_id);

    messageContent.appendChild(messageBody);
    actualMessage.appendChild(messageContent);

    // Adding replies based on logics in the html
    if (data.has_replies) {
        const replySpacer = document.createElement('p');
        replySpacer.classList.add('create-space-eh');

        actualMessage.appendChild(replySpacer);

        const RepliedMessages = createReplyElements(data.has_replies);

        actualMessage.appendChild(RepliedMessages);

    }

    messageContainer.appendChild(chaterInfo);
    messageContainer.appendChild(actualMessage);

    const chatBox = document.getElementById('chat-box'); 
    chatBox.append(messageContainer);

    // if (is_deleted_message){
    //     if (chatBox) {
    //         chatBox.scrollTop = chatBox.scrollHeight;  //Scroll to the bottom davedavedave
    // }        }else {
    //         is_deleted_message = false;
           
    // }

    if (command !== 'messages'){
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
   
}


chatSocket.onclose = function (e) {
    console.error('Chat socket closed unexpectedly');
};



function handleImageUpload(imageFile) {
    if (imageFile && imageFile.type.startsWith("image/")) {
        const width = 1000;
        const reader = new FileReader();

        reader.onload = function (e) {
            const imageData1 = e.target.result;  // Base64 encoded image data  davedave  
            
            let image = document.createElement("img");
            image.src = imageData1;

            image.onload = (event) => {
                let canvas = document.createElement("canvas");
                let ratio = width / event.target.width;
                canvas.width = width;
                canvas.height = event.target.height * ratio;

                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                var imageData = context.canvas.toDataURL("image/jpeg", 40); //THANK GOD THAT EVERYTHING WORKED WELL!!

                chatSocket.send(JSON.stringify({
                    'command': 'new_image_message',
                    'image': imageData,
                    'roomid': roomid,
                    'from': username,
                }));
            }
        };
        reader.readAsDataURL(imageFile);
        document.getElementById('chat-image').value = '';

    }
    else {
        // Handle invalid file selection (optional)
        alert("Please select an image file.");
    }

}


function handleTextMessage(message) {
    chatSocket.send(JSON.stringify({
        'message': message,
        'command': 'new_message',
        'roomid': roomid,
        'from': username,
    }));
    document.querySelector('#myTextarea').value = '';
    document.querySelector('#myTextarea').style.height = 'initial';


}


document.querySelector('#myTextarea').focus();
document.querySelector('#myTextarea').onkeyup = function (e) {
    if (e.key === 'Enter') {  // enter, return
        document.querySelector('#send-button').click();
    }
};


document.getElementById('chat-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission behavior
});


function fetchMessages() {
    chatSocket.send(JSON.stringify({
        'command': 'fetch_messages',
        'roomid': roomid,
    }));
}


chatSocket.onopen = function (e) {

    const chatImageInput = document.getElementById('chat-image');

    chatImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();

            document.getElementById('chat-box').appendChild(imgPreview);

            reader.onload = function (e) {
                if (imgPreview.hasChildNodes()) {
                    imgPreview.classList.toggle('chat-image-shape')
                    imgPreview.innerHTML = '';
                }

                imgPreview.innerHTML = `<img src="${e.target.result}" alt="Selected Image Preview" id="selected-image">`;
                imgPreview.classList.toggle('chat-image-shape');

                if (imgPreview) {
                    const closeIcon = document.createElement("i");
                    closeIcon.classList.add("ri-close-line", "remove-image");
                    imgPreview.appendChild(closeIcon);

                    closeIcon.addEventListener("click", () => {
                        const imageInputDom = document.querySelector('#chat-image');
                        imageInputDom.value = '';
                        imgPreview.innerHTML = '';
                        imgPreview.parentNode.removeChild(imgPreview);
                        imgPreview.classList.toggle('chat-image-shape');  //I WAS ABLE TO HANDLE ERROR BY THE HOLY SPIRIT JUST BY CHANGING TOGGLE TO REMOVE
                    });
                }


            };
            reader.readAsDataURL(file);
        }
        else {
            // Handle invalid file selection (optional)
            alert("Please select an image file.");
        }

    });
    fetchMessages();

    // THE CODE BELOW IS SUPPOSED TO DELETE HTTP FETCHED MESSAGES ON INITIAL VISIT OF A PARTICULAR CHAT ROOM. BUT IT FAILS DUE TO THE SEND BUTTON TOGGLE NOT FOUND ON THE img_preview
    // var messagesContainer = document.getElementById('chat-box');
    // const imgPreview = document.getElementById("img-preview");

    // function clearMessages() {
    //     var childElements = messagesContainer.children;


    //     if (!imgPreview) {
    //         const imgPreview = document.createElement('div');
    //         imgPreview.id = 'img-preview';
    //         messagesContainer.appendChild(imgPreview);
    //     }
    //     for (var i = childElements.length - 1; i >= 0; i--) {
    //         if (childElements[i].id !== 'img-preview') {
    //             messagesContainer.removeChild(childElements[i]);
    //         }
    //     }
    // }
    // imgPreview.innerHTML = ''
    // imgPreview.parentNode.removeChild(imgPreview);
    // imgPreview.classList.toggle('chat-image-shape');
    // imgPreview.classList.toggle('chat-image-shape');

    // clearMessages();


}



document.querySelector('#send-button').onclick = function (e) {
    const messageInputDom = document.querySelector('#myTextarea');
    const imageInputDom = document.querySelector('#chat-image');
    const message = messageInputDom.value.trim(); // Trim whitespace
    const imgPreview = document.getElementById("img-preview");

    if (imgPreview) {
        imgPreview.innerHTML = '';
        imgPreview.parentNode.removeChild(imgPreview);
        imgPreview.classList.toggle('chat-image-shape');
    }
    // imgPreview.classList.toggle('chat-image-shape');


    // Check if image is selected
    if (imageInputDom.files.length > 0) {
        const width = 1000;
        const imageFile = imageInputDom.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            var imageData1 = e.target.result;

            let image = document.createElement("img");
            image.src = imageData1;

            image.onload = (event) => {
                let canvas = document.createElement("canvas");
                let ratio = width / event.target.width;
                canvas.width = width;
                canvas.height = event.target.height * ratio;

                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                var imageData = context.canvas.toDataURL("image/jpeg", 40); //THE CODE HERE IS USED TO REDUCE OR DECREASE THE SIZE OF THE CHAT IMAGES

                if (message) {
                    chatSocket.send(JSON.stringify({
                        'message': message,
                        'command': 'image_and_text',
                        'roomid': roomid,
                        'from': username,
                        'image': imageData,
                    }));
                    messageInputDom.value = '';
                    imageInputDom.value = '';
                    messageInputDom.style.height = 'initial';
    
                }
                else {
                    handleImageUpload(imageFile);
                }
                // Reset input fields
                messageInputDom.value = '';
            } 

        };
        reader.readAsDataURL(imageFile);
    }
    else if (message) {
        if (isEditing) {
            chatSocket.send(JSON.stringify({
                'messageId': edited_message_id,
                'command': 'edited_message',
                'roomid': roomid,
                'message': message,
                'from': username,
            }));
            isEditing = false;
            edited_message_id = null;
            const messageToEdit = document.getElementById('card_response_edit');
            messageToEdit.innerHTML = '';

            document.querySelector('#myTextarea').value = '';
            document.querySelector('#myTextarea').style.height = 'initial';

        } else if (isreplyToMesasage) {
            chatSocket.send(JSON.stringify({
                'messageId': replied_message_id,
                'command': 'replied_message',
                'roomid': roomid,
                'message': message,
                'from': username,
            }));
            isreplyToMesasage = false;
            replied_message_id = null;
            inputInput.placeholder = "Write a message...";
            // const messageToEdit = document.getElementById('card_response_edit');
            // messageToEdit.innerHTML = '';

            document.querySelector('#myTextarea').value = '';
            document.querySelector('#myTextarea').style.height = 'initial';
        } else {
            handleTextMessage(message);
        }
    }
}


topicInput = document.getElementById('browse-topics-input-mobile');
topicInput.focus();
topicInput.onkeyup = function (e) {
    if (e.key === 'Enter') {  // enter, return
        const topic = topicInput.value.trim();

        chatSocket.send(JSON.stringify({
            'what_to_browse': topic,
            'command': 'search_topic',
            'from': 'mobile',
        }));
        topicInput.value = '';

    }
};

topicInputDesktop = document.getElementById('browse-topics-input-desktop');
topicInputDesktop.focus();
topicInputDesktop.onkeyup = function (e) {
    if (e.key === 'Enter') {  // enter, return
        const topic = topicInputDesktop.value.trim();

        chatSocket.send(JSON.stringify({
            'what_to_browse': topic,
            'command': 'search_topic',
            'from': 'dektop',
        }));
        topicInputDesktop.value = '';

    }
};


document.getElementById('browse-topic-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission behavior
});
document.getElementById('browse-topic-form-for-desktop').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission behavior
});



// THE BELOW BLOCK OF CODE SHOWS THE REPLY ICONS WHEN A USER TAPS ON THE REPLY CONTAINER FOR 3 SECS
// const element = document.document.querySelectorAll(".response-to-a-message");
// const icon = document.getElementById("flexing-reply-icons");
// element.forEach(container => {
//     container.addEventListener("touchstart", function() {
//       timeoutId = setTimeout(function() {
//         icon.style.display = "block"; 
//       }, 3000); 
//     });
  
//     container.addEventListener("touchend", function() {
//       clearTimeout(timeoutId);
//     });
//   });