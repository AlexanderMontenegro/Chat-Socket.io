//Cliente

$(function () {
  const socket = io();
  var nick = "";

  //elementos dom
  const messageForm = $("#messages-form");
  const messageBox = $("#message");
  const chat = $("#chat");

  const nickForm = $("#nick-form");
  const nickError = $("#nick-error");
  const nickName = $("#nick-name");

  const userNames = $("#usernames");
  //ewventos
  //mesnaje al servidor
  messageForm.submit((e) => {
    e.preventDefault();
    socket.emit("enviar mensaje", messageBox.val());
    messageBox.val("");
  });
  //conexion de usuario
  socket.on("connect", () => {
    console.log("Usuario conectado: ", socket.id);
    console.log("cantidad de usuarios conectados " + io.engine.clientsCount);

  });

  //desconesion de usuario
  socket.on("disconnect", () => {
    console.log("Usuario desconectado: ", socket.id);
  });





  //respuesta de servidor

  socket.on("nuevo mensaje", function (datos) {
    // console.log(datos);

    let color = "#f4f4f4";

    if (nick == datos.username) {
      color = "#9ff4c5";
    }

    chat.append(
      `<div class="msg-area mb=2 d-flex" style="background-color:${color}" ><b>${datos.username}:</b><p class="msg">${datos.msg}</p></div>`
    );
  });

  //nuevo usuario

  nickForm.submit((e) => {
    e.preventDefault();

    socket.emit("nuevo usuario", nickName.val(), (datos) => {
      if (datos) {
        nick = nickName.val();
        $("#nick-wrap").hide();
        $("#container-wrap").show();
      } else {
        nickError.html(
          '<div clas="alert-danger" >El nombre de usuario ya está en uso</div>'
        );
      }
      nickName.val("");
    });
  });

  //obtenemos usuarios conectados

  socket.on("nuevo usuario", (datos) => {
    let html = "";
    let color = "";
    let salir = "";

    for (let i = 0; i < datos.length; i++) {
      if (nick == datos[i]) {
        color = "#047f43";
        salir = `<a class="enlace-salir" href="/">Salir</a>`;
      } else {
        color = "#333";
        salir = "";
      }
      html += `<p style="color: ${color}">${datos[i]} ${salir}</p>`;
    }

    userNames.html(html);
  });
});
