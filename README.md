<h2 align="center">Realtime Application with NestJS</h2>
  
<h3 align="center">Build a chatting App using Socket.io and NestJs</h3>

This project is inspired by Mr.DenzelCode's repository  [Nest-Auth](https://github.com/DenzelCode/nest-auth)

It's my attempt to embrace best practices of using MongoDB, and trying to write maintainabe code, based on my experience acquired by building several NestJs projects previously.
It might not be that fancy, but I hope you can learn something new from this project too, just like I did 😃

## Project highlights:
1. **NestJs** backend framework
2. **MongoDB**
3. **SocketIO** realtime app framework
4. **JWT** authentication
5. **Class-transformer, Class-validator** for validation
6. **Swagger** for API documentation

### APIs
**Auth controller**\
Register, login, logout, refresh token
<p><img src="./asset/auth-controller.png"></p>

**Code Controller**\
Issue code to verify your email (for account registration or password recovery)
<p><img src="./asset/code-controller.png"></p>

**Request Controller**\
Manage friend request, group request, group invitation
<p><img src="./asset/request-controller.png"></p>

**User Controller**\
Search users
<p><img src="./asset/user-controller1.png"></p>

Update profile
<p><img src="./asset/user-controller2.png"></p>

Manage user friends and groups
<p><img src="./asset/user-controller3.png"></p>

**Group Controller**\
Search groups
<p><img src="./asset/group-controller1.png"></p>

Manage user groups
<p><img src="./asset/group-controller2.png"></p>

**Message Controller**\
Manage direct and group messages
<p><img src="./asset/message-controller.png"></p>

### Gateways

Connect Socket.io server (login with token)
<p><img src="./asset/connect-server.png"></p>

#### User Gateway

**logout**
<p><img src="./asset/logout-server.png"></p>

#### Message Gateway

**message:direct** (send direct message)
<p><img src="./asset/direct-message.png"></p>

**message:group** (send group message)
<p><img src="./asset/group-message.png"></p>

## Manually testing
First, download the source code, then run:
```
npm install
npm run dev
```

To test API, visit http://localhost:3000/api

To test Gateway, use Postman Desktop and this sample collection\
👉 [socketio-server-collection](https://www.postman.com/dark-firefly-114703/workspace/nestjs-server/collection/655d95716d9c2bc849661a32?action=share&creator=31321708)

**Thank you and happy coding!**