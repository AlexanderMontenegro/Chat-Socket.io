module.exports = (io) =>{
    io.on('connection', socket => {
        console.log('nuevo usuario conectado');
})}