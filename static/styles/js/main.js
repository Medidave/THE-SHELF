const menuToggleIcon = document.querySelector('#menu-toggle-icon');
const dropdown = document.querySelector('#menu');

const toggleMenu = () => {
  dropdown.classList.toggle('activated');
  menuToggleIcon.classList.toggle('activated');
  console.log('I am Dave')
}

menuToggleIcon.addEventListener('click', toggleMenu);

document.onclick = function (e){
  if (!menuToggleIcon.contains(e.target) && !dropdown.contains(e.target)){
     dropdown.classList.remove('activated');
    menuToggleIcon.classList.remove('activated');
  }
}




// function getCookie(name) {
//   var cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     var cookies = document.cookie.split(';');
//     for (var i = 0; i < cookies.length; i++) {
//       var cookie = cookies[i].trim();
//       // Check if name matches cookie name (don't include "=")
//       if (cookie.substring(0, name.length + 1) === (name + '=')) {
//         cookieValue = cookie.substring(name.length + 1);
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }
// $(document).ready(function() {
//   $('.chat-send').on('click', '.send', function(event) {
//     event.preventDefault();
//     var csrftoken = getCookie('csrftoken');

//     var data = {};
//     data['csrfmiddlewaretoken'] = csrftoken;

//     var message = $('.chat-input').val();
//     data['message'] = message;


//     // Define the Ajax request as a function
//     function makeRequest() {
//       $.ajax({
//         type: 'POST',
//         url: '/createMessage/' + 'dave' + '/',
//         data: data,
//         success: function(response) {
//           if (response.status === 'success') {
//             console.log("Dave the ceo");

//           } else {
//             // alert('Error: ' + response.message);
//           }
//         },
//         error: function(xhr, status, error) {
//           // alert('An error occurred: ' + error);
//         }
//       });
//     }

//     // Call the function immediately and then every second
//     makeRequest();
//     setInterval(makeRequest, 1000);
//   });
// });

// function getCookie(name) {
//   var cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     var cookies = document.cookie.split(';');
//     for (var i = 0; i < cookies.length; i++) {
//       var cookie = cookies[i].trim();
//       // Check if name matches cookie name (don't include "=")
//       if (cookie.substring(0, name.length + 1) === (name + '=')) {
//         cookieValue = cookie.substring(name.length + 1);
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }

// $(document).ready(function() {
//   $('.chat-send').on('click', '.send', function(event) {
//     event.preventDefault();

//     var csrftoken = getCookie('csrftoken');
//     var message = $('.chat-input').val();

//     var data = {
//       'csrfmiddlewaretoken': csrftoken,
//       'message': message
//     };

//     // Make the Ajax request
//     $.ajax({
//       type: 'POST',
//       url: '/createMessage/' + 'dave' + '/',  // Update this URL with your actual endpoint
//       data: data,
//       success: function(response) {
//         if (response.status === 'success') {
//           console.log("Message sent successfully.");
//           // Clear the input field
//           $('.chat-input').val('');
//           console.log(response.json_message)
//         } else {
//           console.log('Error: ' + response.message);
//         }
//       },
//       error: function(xhr, status, error) {
//         console.log('An error occurred: ' + error);
//       }
//     });
//   });
// });

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Check if name matches cookie name (don't include "=")
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = cookie.substring(name.length + 1);
        break;
      }
    }
  }
  return cookieValue;
}

$(document).ready(function() {
  $('.chat-send').on('click', '.send', function(event) {
    event.preventDefault();

    var csrftoken = getCookie('csrftoken');
    var message = $('.chat-input').val();

    var data = {
      'csrfmiddlewaretoken': csrftoken,
      'message': message
    };

    // Make the Ajax request
    $.ajax({
      type: 'POST',
      url: '/createMessage/' + 'dave' + '/',  // Update this URL with your actual endpoint
      data: data,
      success: function(response) {
        if (response.status === 'success') {
          console.log("Message sent successfully.");
          // Clear the input field
          $('.chat-input').val('');

          // Clear the chat container before appending new messages
          $('.x').html('');

          // Loop through json_message and append new HTML
          response.json_message.forEach(function(msg) {
            var messageHTML;
            if (msg.is_user) {
              messageHTML = `
                <span class="message request-user">
                    <p class="the-chat heyyyy-message request-user-message">${msg.message}</p>  
                </span>
              `;
            } else {
              messageHTML = `
                <span class="message">
                    <span class="user-info">
                        <img src="http://127.0.0.1:8000/static/images/dave1.jpg" alt="img" class="user-image">
                        <p>${msg.user_name}</p>
                    </span>
                    <p class="the-chat heyyyy">${msg.message}</p>
                </span>
              `;
            }
            $('.x').append(messageHTML);
          });

          var chatContainer = $('.x');
          chatContainer.scrollTop(chatContainer.prop("scrollHeight"));
        } else {
          console.log('Error: ' + response.message);
        }
      },
      error: function(xhr, status, error) {
        console.log('An error occurred: ' + error);
      }
    });
  });
});