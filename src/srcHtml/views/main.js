$(function () {
  const FADE_TIME = 150;
  const TYPING_TIMER_LENGTH = 400;
  const COLORS = [
    "#e21400",
    "#91580f",
    "#f8a700",
    "#f78b00",
    "#58dc00",
    "#287b00",
    "#a8f07a",
    "#4ae8c4",
    "#3b88eb",
    "#3824aa",
    "#a700ff",
    "#d300e7",
  ];

  // Variables del DOM
  const $window = $(window);
  const $messages = $(".messages");
  const $inputMessage = $(".inputMessage");

  const socket = io();

  // Mensaje de entrada al chat
  let username;
  let connected = false;
  let typing = false;
  let lastTypingTime;
  let $currentInput = $inputMessage.focus();

  const addParticipantsMessage = (data) => {
    let message = "";
    if (data.numUsers === 1) {
      message += `Solo hay un participante en la sala`;
    } else {
      message += `Hay ${data.numUsers} participantes en la sala`;
    }
    log(message);
  };

  // Establecemos el nombre
  const setUsername = () => {
    username = document.getElementById("usuario").innerHTML;

    if (username) {
      $currentInput = $inputMessage.focus();
      socket.emit("add user", username);
    }
  };
  setUsername();

  // Mandar un mensaje
  const sendMessage = () => {
    let message = $inputMessage.val();
    message = cleanInput(message);
    if (message && connected) {
      $inputMessage.val("");
      addChatMessage({ username, message });
      socket.emit("new message", message);
    }
  };

  // Etiqueta
  const log = (message, options) => {
    const $el = $("<li>").addClass("log").text(message);
    addMessageElement($el, options);
  };

  // Agregar el mensaje a la lista
  const addChatMessage = (data, options = {}) => {
    const $typingMessages = getTypingMessages(data);
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    const $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css("color", getUsernameColor(data.username));
    const $messageBodyDiv = $('<span class="messageBody">').text(data.message);

    const typingClass = data.typing ? "typing" : "";
    const $messageDiv = $('<li class="message"/>')
      .data("username", data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  };

  // Mensaje de "Escribiendo..."
  const addChatTyping = (data) => {
    data.typing = true;
    data.message = "está escribiendo";
    addChatMessage(data);
  };

  // Eliminar el mensaje de "Escribiendo..."
  const removeChatTyping = (data) => {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  };

  const addMessageElement = (el, options) => {
    const $el = $(el);
    if (!options) {
      options = {};
    }
    if (typeof options.fade === "undefined") {
      options.fade = true;
    }
    if (typeof options.prepend === "undefined") {
      options.prepend = false;
    }

    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }

    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  const cleanInput = (input) => {
    return $("<div/>").text(input).html();
  };

  // Actualizar evento typing
  const updateTyping = () => {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit("typing");
      }
      lastTypingTime = new Date().getTime();

      setTimeout(() => {
        const typingTimer = new Date().getTime();
        const timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit("stop typing");
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  };

  // Mensaje de alguien typeando
  const getTypingMessages = (data) => {
    return $(".typing.message").filter(function (i) {
      return $(this).data("username") === data.username;
    });
  };

  // Color de usuario random
  const getUsernameColor = (username) => {
    let hash = 7;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    const index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  };

  // Eventos de keyboard

  $window.keydown((event) => {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit("stop typing");
        typing = false;
      } else {
        // setUsername();
      }
    }
  });

  $inputMessage.on("input", () => {
    updateTyping();
  });

  // Eventos del click

  // $loginPage.click(() => {
  //   $currentInput.focus();
  // });

  $inputMessage.click(() => {
    $inputMessage.focus();
  });

  // Eventos del socket

  socket.on("login", (data) => {
    connected = true;
    const message = "Bienvenido al chat del e-commerce – ";
    log(message, {
      prepend: true,
    });
    addParticipantsMessage(data);
  });

  socket.on("new message", (data) => {
    addChatMessage(data);
  });

  socket.on("user joined", (data) => {
    log(`${data.username} se unió`);
    addParticipantsMessage(data);
  });

  socket.on("user left", (data) => {
    log(`${data.username} se ha ido`);
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  socket.on("typing", (data) => {
    addChatTyping(data);
  });

  socket.on("stop typing", (data) => {
    removeChatTyping(data);
  });

  socket.on("disconnect", () => {
    log("Te has desconectado");
  });

  socket.io.on("reconnect", () => {
    log("Te has reconectado");
    if (username) {
      socket.emit("add user", username);
    }
  });

  socket.io.on("reconnect_error", () => {
    log("Intento de reconexión fallido");
  });
});
async function borrarProd(e) {
  console.log(e);
  await fetch(`http://localhost:8080/deleteProd/` + e, {
    method: "DELETE",
  })
    .then((res) => res.text())
    .then((res) => console.log(res));
}

async function borrarUser(e) {
  console.log(e);
  await fetch(`http://localhost:8080/deleteUser/` + e, {
    method: "DELETE",
  })
    .then((res) => res.text())
    .then((res) => console.log(res));
}
