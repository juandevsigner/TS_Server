import * as dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export abstract class ConfigServer {
  constructor() {
    const nodeNameEnv = this.createPathEnv(this.nodeEnv);
    dotenv.config({
      path: nodeNameEnv,
    });
  }
  public getEnviroment(k: string) {
    return process.env[k];
  }
  public getNumberEnv(k: string): number {
    return Number(this.getEnviroment(k));
  }

  public get nodeEnv(): string {
    return this.getEnviroment("NODE_ENV")?.trim() || "";
  }
  public createPathEnv(path: string): string {
    const arrEnv: Array<string> = ["env"];
    if (path.length > 0) {
      const stringToArray = path.split(".");
      arrEnv.unshift(...stringToArray);
    }
    return "." + arrEnv.join(".");
  }

  public get typeORMConfig(): DataSourceOptions {
    return {
      type: "mysql",
      host: this.getEnviroment("DB_HOST"),
      port: this.getNumberEnv("DB_PORT"),
      username: this.getEnviroment("DB_USER"),
      password: this.getEnviroment("DB_PASSWORD"),
      database: this.getEnviroment("DB_DATABASE"),
      // entities: [__dirname + "/../**/*.entity{.ts,.js}"], // Si queremos que busque fuera de un directorio y por nombre de archivo y extensión
      entities: [__dirname + "entities/*.entity{.ts,.js}"],
      migrations: [__dirname + "../../migrations/*{.ts, .js}"],
      synchronize: true,
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
    };
  }

  async dbConnect(): Promise<void> {
    try {
      await new DataSource(this.typeORMConfig as any).initialize();
      console.log("*---------DB CONNECT CORRECTLY------------*");
    } catch (error) {
      console.log("ERROR IN DATA BASE CONNECTION");
    }
  }
}
