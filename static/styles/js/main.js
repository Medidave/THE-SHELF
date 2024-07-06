// Grab elements
const selectElement = (selector) => {
    const element = document.querySelector(selector);
    if(element) return element;
    throw new Error(`Something went wrong! Make sure that ${selector} exists/is typed correctly.`);  
};

//Nav styles on scroll
const scrollHeader = () =>{
    const navbarElement = selectElement('#header');
    if(this.scrollY >= 15) {
        navbarElement.classList.add('activated');
    } else {
        navbarElement.classList.remove('activated');
    }
}
window.addEventListener('scroll', scrollHeader);
const menuToggleIcon = selectElement('#menu-toggle-icon');


// SCRIPTS FOR OPENING THE NAVBAR AND MAKING IT DISAPPEAR ON THE DOCUMENT PRESS
const mobileMenu = selectElement('#menu');
const toggleMenu = () =>{
    mobileMenu.classList.toggle('activated');
    menuToggleIcon.classList.toggle('activated');

    if (sideBarParticipants.classList.contains('open-sidbar-for-participants')){
      sideBarParticipants.classList.toggle("open-sidbar-for-participants");
    }

    if (sideBar.classList.contains('open-sidbar-for-topics')){
      sideBar.classList.toggle("open-sidbar-for-topics");
    }

    document.onclick = function (e){
      const mobileMenu = selectElement('#menu');
    
      if (!menuToggleIcon.contains(e.target) && !mobileMenu.contains(e.target)){
        mobileMenu.classList.remove('activated');
        menuToggleIcon.classList.remove('activated');
      }
    }
    
    console.log('I am Dave the CEO')
}
menuToggleIcon.addEventListener('click', toggleMenu);

document.onclick = function (e){
  const mobileMenu = selectElement('#menu');

  if (!menuToggleIcon.contains(e.target) && !mobileMenu.contains(e.target)){
    mobileMenu.classList.remove('activated');
    menuToggleIcon.classList.remove('activated');
  }
}


// THE SCRIPTS BELOW IS RESPONSIBLE FOR MAKING THE NAV ELEMENTS WHITE BASED ON THE URL
const homeLink = document.querySelector('.home-link');
const projectLink = document.querySelector('.projects-link');
const about_usLink = document.querySelector('.about-us-link');
const eventsLink = document.querySelector('.events-link');
const siceLink = document.querySelector('.sice-link');
const chatLink = document.querySelector('.chat-room-link');
const signinLink = document.querySelector('.signin-link');
const signinLinkDesk = document.querySelector('.signin-link-for-desk');
const AccountLink = document.querySelector('.account-link');
const AccountLinkDesk = document.querySelector('.account-link-for-desk');

// const serviceLink = document.querySelector('.service-link');
// const serviceLink = document.querySelector('.service-link');


const pathname = window.location.pathname;

if (pathname.startsWith('/project/')) {
  projectLink.classList.add('active-link');
  homeLink.classList.remove('active-link');
}
else if (pathname.startsWith('/about_us/')) {
  about_usLink.classList.add('active-link');
  homeLink.classList.remove('active-link');
}
else if (pathname.startsWith('/events/')) {
  eventsLink.classList.add('active-link');
  homeLink.classList.remove('active-link');
}
else if (pathname.startsWith('/SICE/')) {
  siceLink.classList.add('active-link');
  homeLink.classList.remove('active-link');
}
else if (pathname.startsWith('/CHAT_ROOM/chat-room/')) {
  chatLink.classList.add('active-link');
  homeLink.classList.remove('active-link');
}
else if (pathname.startsWith('/epsu_members/login/')) {
  signinLink.classList.add('active-link');
  homeLink.classList.remove('active-link');
  signinLinkDesk.classList.add('active-link');
}
else if (pathname.startsWith('/epsu_members/user-profile/')) {
  AccountLink.classList.add('active-link');
  homeLink.classList.remove('active-link');
  AccountLinkDesk.classList.add('active-link');
}

// const navbarItem = document.getElementById(menu);
// const dropdownMenu = document.getElementById(dropdown);

// navbarItem.addEventListener('mouseenter', function(event){
//     dropdownMenu.style.display = 'block';
// });

// dropdownMenu.addEventListener('mouseleave', function(event){
//     if(!navbarItem.contains(event.target)){
//         dropdownMenu.style.display = 'none';
//     }
// });



// Initialize Swiper
    var swiper = new Swiper(".mySwiper", {
      slidesPerView: 1,
      spaceBetween: 10,
      centeredSlides: false,
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 40,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 50,
        },
      },
    });


    var swiper2 = new Swiper(".mySwiper1", {
    speed: 600,
    parallax: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    autoplay: {
      delay: 17000,
      disableOnInteraction: false,
    },
});

// CODE TO MAKE THE DJANGO MESSAGES DISAPPEAR
// const closemessage = document.getElementById('btn-close');
// const messageContainer = document.getElementById('the=message-cont');

// closemessage.addEventListener('click', () => {
//   messageContainer.classList.add('remove-message-container');
//   console.log("davedavedavedvae");
// })


// THE BELOW SCRIPTS ARE THE CODE FOR THE TOPIC AND THE PARTICIPANTS  BUTTONS AT THE CHATROOM
const openButton = document.getElementById('open-button-topics');
const sideBar = document.getElementById('sidebar-topics');
const closeButton = document.getElementById('close-topics');

openButton.addEventListener("click", () => {
  sideBar.classList.toggle("open-sidbar-for-topics")
  if (sideBarParticipants.classList.contains('open-sidbar-for-participants')){
    sideBarParticipants.classList.toggle("open-sidbar-for-participants");
  }
  if (mobileMenu.classList.contains('activated')){
    mobileMenu.classList.toggle('activated');
    menuToggleIcon.classList.toggle('activated');
  }

 document.onclick = function (e){
  if (!sideBar.contains(e.target) && !openButton.contains(e.target)){
    sideBar.classList.remove("open-sidbar-for-topics");
    if (sideBarParticipants.classList.contains('open-sidbar-for-participants')){
      sideBarParticipants.classList.toggle("open-sidbar-for-participants")
    }

  }
}
});


closeButton.addEventListener("click", () => {
  sideBar.classList.toggle("open-sidbar-for-topics");
});


const openButtonParticipants = document.getElementById('open-button-participants');
const sideBarParticipants = document.getElementById('sidebar-participants');
const closeButtonParticpants = document.getElementById('close-participants');

openButtonParticipants.addEventListener("click", () => {
  sideBarParticipants.classList.toggle("open-sidbar-for-participants")
  if (sideBar.classList.contains('open-sidbar-for-topics')){
    sideBar.classList.toggle("open-sidbar-for-topics");
  }

  if (mobileMenu.classList.contains('activated')){
    mobileMenu.classList.toggle('activated');
    menuToggleIcon.classList.toggle('activated');
  }

  document.onclick = function (e){
    if (!sideBarParticipants.contains(e.target) && !openButtonParticipants.contains(e.target)){
      sideBarParticipants.classList.remove("open-sidbar-for-participants");
      if (sideBar.classList.contains('open-sidbar-for-topics')){
        sideBar.classList.toggle("open-sidbar-for-topics")
      }
  
    }
  }
  
}
  );

closeButtonParticpants.addEventListener("click", () => {
  sideBarParticipants.classList.toggle("open-sidbar-for-participants");
});


// // THIS JS CODE IS FOR TAKING FILES FROM USERS
// const chatImageInput = document.getElementById('chat-image');
// const messageForm = document.getElementById('chat-form');
// const imgPreview = document.getElementById("img-preview");
// const sendbutton = document.getElementById("send-button");


// chatImageInput.addEventListener('change', function(event) {
//   const file = event.target.files[0];
//   // Add validation for file size and type (optional)
//   if (file && file.type.startsWith("image/")) {
//     const reader = new FileReader();

//     reader.onload = function(e) {
//       imgPreview.innerHTML = `<img src="${e.target.result}" alt="Selected Image Preview">`;
//       imgPreview.classList.toggle('chat-image-shape')
//     };

//     reader.readAsDataURL(file);
//   } else {
//     // Handle invalid file selection (optional)
//     alert("Please select an image file.");
//   }
// });

// messageForm.addEventListener('submit', function(event) {
//   // Check if image is selected and handle form submission accordingly
//   const imageInput = document.getElementById('chat-image');

//   document.getElementById("send-button").addEventListener('click', () => {
//   document.getElementById('send-button').disabled = true;
//   });
//   if (imageInput.files.length > 0) {
//     // Modify form data to handle image upload (explained later)
//   }
// });



// THE BELOW CODE IS RESPONSIBLE FOR MAKING THE TEXTAREA INPUT GROW AS THE CONTENT OF THE TEXT GROWS
const textarea = document.getElementById('myTextarea');

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
});


// MAKE THE SCROLL BAR OF THE CHAT BOX TO DISPLAY THE CURRENT TEXT ALWAYS 
window.onload = function() {
  const chatBox = document.getElementById("chat-box");
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
  }
};


window.onload = function() {
  var iframes = document.getElementsByTagName('iframe');
  for (var i = 0; i < iframes.length; i++) {
    iframes[i].setAttribute('autoplay', 'false');
  }
};

// SCRIPTS RESPONSIBLE FOR SUBMITTING THE FORM RESPONSIBLE FOR SORTING OT SEARCHING TOPICS 
const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');

searchInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {  // Check for Enter key (keyCode 13)
    searchForm.submit();  // Submit the form
  }
});

// Select the element with the ID "id_date_of_birth"
const dateOfBirthElement = document.getElementById("id_date_of_birth");
if (dateOfBirthElement) {
  dateOfBirthElement.placeholder = "YYYY-MM-DD";
} else {
  console.warn("Element with ID 'id_date_of_birth' not found!");
}



// THE BELOW CODE IS AN AJAX CODE RESPONSIBLE FOR UPDATING THE CHAT-FORUM WITHOUT PAGE RELOAD
// $(document).ready(function() {
//   $('#message-form').submit(function(event) {
//       event.preventDefault();
//       var content = $('#message-input').val();
//       $.ajax({
//           type: 'POST',
//           url: '/send_message/',
//           data: {
//               'content': content,
//               'csrfmiddlewaretoken': '{{ csrf_token }}'
//           },
//           dataType: 'json',
//           success: function(response) {
//               $('#chat-messages').append('<div>' + response.message + '</div>');
//               $('#message-input').val('');
//           },
//           error: function(xhr, errmsg, err) {
//               console.log(xhr.status + ": " + xhr.responseText);
//           }
//       });
//   });
// });


// function makePayment() {
    //   FlutterwaveCheckout({
    //     public_key: "FLWPUBK_TEST-d10e72e41aabaaedd03bdf433ff93860-X",
    //     tx_ref: "titanic-48981487343MDI0NzMx",
    //     amount: 54600,
    //     currency: "GHS",
    //     payment_options: "card, mobilemoneyghana, ussd",
    //     redirect_url: "http://127.0.0.1:8000/SICE/",
    //     meta: {
    //       consumer_id: 23,
    //       consumer_mac: "92a3-912ba-1192a",
    //     },
    //     customer: {
    //       email: "davidawitor23@gmail.com",
    //       phone_number: "0549188552",
    //       name: "Awitor David",
    //     },
    //     customizations: {
    //       title: "EPSU-KNUST",
    //       description: "Payment for an awesome cruise",
    //       logo: "../../static/images/EPSU.jpg",
    //     },
    //   });
    // }

    function makePayment() {
      FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-d10e72e41aabaaedd03bdf433ff93860-X",
        tx_ref: "titanic-48981487343MDI0NzMx",
        amount: 500,
        currency: "USD",
        payment_options: "card, mobilemoneyghana, ussd",
        redirect_url: "http://127.0.0.1:8000/SICE/",
        meta: {
          consumer_id: 23,
          consumer_mac: "92a3-912ba-1192a",
        },
        customer: {
          email: "davidawitor23@gmail.com",
          phone_number: "0549188552",
          name: "Awitor David",
        },
        customizations: {
          title: "EPSU-KNUST",
          description: "Payment for an awesome cruise",
          logo: "../../static/images/EPSU.jpg",
        },
      });
    }
    
    
// THIS CODE IS RESPONSIBLE FOR SETTING THE CONTENT HEADER ATTACHMENT AT AWS S3
document.getElementById("downloadLink").addEventListener("click", function() {
  this.href += "?Content-Disposition=attachment";
});



// const chatContainer = document.getElementById('chatContainer');
// const preloader = document.getElementById('preloader');

// // Function to show the preloader
// function showPreloader() {
//   preloader.classList.add('visible'); // Add a CSS class for visibility
// }

// // Function to hide the preloader
// function hidePreloader() {
//   preloader.classList.remove('visible');
// }

//  // Show preloader before fetching messages
//  chatContainer.addEventListener('message-loading', showPreloader);

