module.exports = (io) => {
  let nickNames = {};
  let rooms = {}; 

  const updateUsersCount = () => {
    io.sockets.emit("user count", io.engine.clientsCount);
  };

  io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado " + socket.id);
    updateUsersCount();

    socket.on("enviar mensaje", (datos) => {
      io.sockets.to(socket.room).emit("nuevo mensaje", {
        msg: datos,
        username: socket.nickname,
      });
    });

    socket.on("nuevo usuario", (datos, callback) => {
      if (Object.values(nickNames).includes(datos)) {
        callback(false);
      } else {
        callback(true);
        socket.nickname = datos;
        nickNames[socket.id] = datos;
        updateUsersInRooms();
      }
    });

    socket.on("crear sala", (roomName, isPrivate, password, callback) => {
      if (rooms[roomName]) {
        callback({ success: false, message: "Sala ya existe" });
      } else {
        rooms[roomName] = { private: isPrivate, members: [], password: isPrivate ? password : null };
        callback({ success: true, message: "Sala creada" });
      }
    });

    socket.on("unirse sala", (roomName, password, callback) => {
      if (rooms[roomName]) {
        if (rooms[roomName].private && rooms[roomName].password !== password) {
          callback({ success: false, message: "Contraseña incorrecta" });
          return;
        }
        socket.join(roomName);
        rooms[roomName].members.push(socket.id);
        socket.room = roomName;
        socket.emit("actualizar usuarios", getRoomUsers(roomName));
        io.sockets.to(roomName).emit("nuevo mensaje", { msg: `${socket.nickname} se ha unido a la sala`, username: "Sistema" });
        callback({ success: true, message: "Unido a la sala" });
        updateUsersInRooms();
      } else {
        callback({ success: false, message: "Sala no existe" });
      }
    });

    socket.on("salir sala", () => {
      const roomName = socket.room;
      if (roomName) {
        socket.leave(roomName);
        rooms[roomName].members = rooms[roomName].members.filter(id => id !== socket.id);
        socket.room = null;
        io.sockets.to(roomName).emit("actualizar usuarios", getRoomUsers(roomName));
        io.sockets.to(roomName).emit("nuevo mensaje", { msg: `${socket.nickname} ha salido de la sala`, username: "Sistema" });
        updateUsersInRooms();
      }
    });

    socket.on("disconnect", () => {
      console.log("El usuario " + socket.id + " se ha desconectado.");
      if (nickNames[socket.id]) {
        const roomName = socket.room;
        if (roomName) {
          rooms[roomName].members = rooms[roomName].members.filter(id => id !== socket.id);
          io.sockets.to(roomName).emit("actualizar usuarios", getRoomUsers(roomName));
          io.sockets.to(roomName).emit("nuevo mensaje", { msg: `${nickNames[socket.id]} ha salido de la sala`, username: "Sistema" });
        }
        delete nickNames[socket.id];
        updateUsersInRooms();
        updateUsersCount();
      }
    });

    const getRoomUsers = (roomName) => {
      return rooms[roomName].members.map(id => nickNames[id] || "Desconocido");
    };

    const updateUsersInRooms = () => {
      Object.keys(rooms).forEach(roomName => {
        io.sockets.to(roomName).emit("actualizar usuarios", getRoomUsers(roomName));
      });
    };
  });
};
