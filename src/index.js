import http from "http";
import app from "./server";
const port = process.env.PORT;

const server = http.createServer(app);

server.listen(port, console.log("The server is working..."));
