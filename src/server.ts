import * as express from "express";
import * as mongoose from "mongoose";
import * as compression from "compression";
import * as cors from "cors";

import { taskRoutes } from "./routes/task.routes";
import { userRoutes } from "./routes/user.routes";
import { env_vars } from "./config";
import helmet from "helmet";
import * as passport from "passport";
import errHandler from "./middlewares/errHandler";
import customResponses from "./middlewares/custom.middleware";

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();

    this.routes();
    this.mongo();
  }

  public routes(): void {
    this.app.use("/api/v1/users", userRoutes.router);
    this.app.use("/api/v1/tasks", taskRoutes.router);
    this.app.use(errHandler);
  }

  public config(): void {
    this.app.use(customResponses);
    this.app.set("port", process.env.PORT || 3000);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(passport.initialize());
  }

  private mongo() {
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("Mongo Connection Established");
    });
    connection.on("reconnected", () => {
      console.log("Mongo Connection Reestablished");
    });
    connection.on("disconnected", () => {
      console.log("Mongo Connection Disconnected");
      console.log("Trying to reconnect to Mongo ...");
      setTimeout(() => {
        mongoose.connect(env_vars.mongoose.url);
      }, 3000);
    });

    connection.on("close", () => {
      console.log("Mongo Connection Closed");
    });
    connection.on("error", (error: Error) => {
      console.log("Mongo Connection ERROR: " + error);
    });

    const run = async () => {
      await mongoose.connect(env_vars.mongoose.url);
    };
    run().catch((error) => console.error(error));
  }

  public start(): void {
    this.app.listen(this.app.get("port"), () => {
      console.log(
        "  API is running at http://localhost:%d",
        this.app.get("port")
      );
    });
  }
}

const server = new Server();

server.start();
