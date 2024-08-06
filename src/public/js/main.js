$(function () {
  const socket = io();
  let nick = "";

  // Elementos DOM
  const messageForm = $("#messages-form");
  const messageBox = $("#message");
  const chat = $("#chat");

  const nickForm = $("#nick-form");
  const nickError = $("#nick-error");
  const nickName = $("#nick-name");

  const roomForm = $("#create-room-form");
  const roomName = $("#room-name");
  const roomType = $("#room-type");
  const roomPassword = $("#room-password");
  const roomError = $("#room-error");

  const joinRoomForm = $("#join-room-form");
  const joinRoomName = $("#join-room-name");
  const joinRoomPassword = $("#join-room-password");

  const leaveRoomBtn = $("#leave-room-btn");
  const userNames = $("#usernames");

  // Enviar mensaje
  messageForm.submit((e) => {
    e.preventDefault();
    socket.emit("enviar mensaje", messageBox.val());
    messageBox.val("");
  });

  // Registro de usuario
  nickForm.submit((e) => {
    e.preventDefault();
    socket.emit("nuevo usuario", nickName.val(), (response) => {
      if (response) {
        nick = nickName.val();
        $("#nick-wrap").hide();
        $("#room-wrap").show();
      } else {
        nickError.html(`<div class="alert-danger">Nombre de usuario ya en uso</div>`);
      }
      nickName.val("");
    });
  });

  // Crear sala
  roomForm.submit((e) => {
    e.preventDefault();
    const isPrivate = roomType.val() === "private";
    const password = isPrivate ? roomPassword.val() : null;
    socket.emit("crear sala", roomName.val(), isPrivate, password, (response) => {
      if (response.success) {
        alert(response.message);
      } else {
        roomError.html(`<div class="alert-danger">${response.message}</div>`);
      }
      roomName.val("");
      roomPassword.val("");
    });
  });

  // Unirse a sala
  joinRoomForm.submit((e) => {
    e.preventDefault();
    const password = joinRoomPassword.val() || null;
    socket.emit("unirse sala", joinRoomName.val(), password, (response) => {
      if (response.success) {
        $("#container-wrap").show();
        $("#room-wrap").hide();
      } else {
        roomError.html(`<div class="alert-danger">${response.message}</div>`);
      }
      joinRoomName.val("");
      joinRoomPassword.val("");
    });
  });

  // Salir de sala
  leaveRoomBtn.click(() => {
    socket.emit("salir sala");
    $("#container-wrap").hide();
    $("#room-wrap").show();
  });

  // Recibir mensajes
  socket.on("nuevo mensaje", (datos) => {
    chat.append(`<div><strong>${datos.username}:</strong> ${datos.msg}</div>`);
  });

  // Actualizar lista de usuarios
  socket.on("actualizar usuarios", (nicks) => {
    userNames.html(nicks.map((nick) => `<div>${nick}</div>`).join(""));
  });

  // Contador de usuarios
  socket.on("user count", (count) => {
    $("#user-count").text(`Usuarios en línea: ${count}`);
  });
});
