import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routers/api";
import sqlite from "sqlite";

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, GET, PATCH");
    return res.status(200).json({});
  }
  next();
});

app.use("/users", router);
app.use("/drivers", router);
app.use("/pickup", router);
app.use("/login", router);
app.use("/v1/payment/drivers", router);
app.use("/v1/users/pickup", router);
app.use("/v1/pickup/payment", router);
app.use("/v1/pickup/users", router);
app.use("/payment", router);

app.use("/driverpickup", router);

app.use("/driverpayment", router);

app.use((req, res, next) => {
  const error = new Error("Soory you are using a wrong API");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});
export default app;
