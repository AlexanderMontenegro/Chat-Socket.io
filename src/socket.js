module.exports = (io) =>{
  let nickNames = [];




  io.on('connection', socket => {
      console.log('nuevo usuario conectado ' + socket.id);
      console.log("cantidad de usuarios conectados "+ io.engine.clientsCount);
      

       //caprturamos mensaje y usuario

       socket.on("enviar mensaje", (datos) =>{
         // console.log(datos)

         io.sockets.emit("nuevo mensaje",{
          msg:datos,
          username:socket.nickname
         });

      });

      socket.on("nuevo usuario",(datos, callback)=>{
          if(nickNames.indexOf(datos) != -1){
              callback(false);
          }else{
              callback(true);
              socket.nickname = datos;
              nickNames.push(socket.nickname);

              io.sockets.emit("nuevo usuario", nickNames);
          }


      });


      socket.on("disconnect", (datos)=>{
          console.log("el usuario " + socket.id + " se ha desconectado.");
          
          if(!socket.nickname){ return;
          }else{
              nickNames.splice(nickNames.indexOf(socket.nickname), 1);
              io.sockets.emit("nuevo usuario", nickNames);
          }
 
      })
})}