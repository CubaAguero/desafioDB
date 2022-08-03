import express from 'express'
import { Server as HttpServer } from 'http'
import { Server as IOServer } from 'socket.io'

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

import { optionsMySql, optionsSQLite } from './containers/options/options'
import  Container from './containers/container'
import Chat from './containers/chat'

const container1 = new Container(optionsMySql, 'productos')
//container1.NewTable()
const chat1 = new Chat(optionsSQLite, 'chat')
//chat1.CreateTable()

io.on("connection", async socket => {
    console.log("Nuevo cliente conectado")
    let res = await container1.getAll()
    let resChat = await chat1.getAll()
    socket.emit("productos", res)
    socket.emit("chat", resChat)

    socket.on('save', async productos => {
        await container1.Save(productos)
        let res = await container1.getAll()
        io.sockets.emit("productos", res)
    })

    socket.on('newMessage', async msj => {
        msj.fyh = new Date().toLocaleString()
        await chat1.saveMassege(msj)
        let chat = await chat1.getAll()
        io.sockets.emit('chat', chat)
    }) 
})


const PORT = process.env.PORT || 8080;
const connectedServer = httpServer.listen(PORT, () => {
    console.log(`Servidor Http con Websockets en el puerto ${connectedServer.address().port}`)
})
connectedServer.on('err', err => console.log(`Error en servidor ${err}`))