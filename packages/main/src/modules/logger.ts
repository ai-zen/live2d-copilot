import { app } from "electron";
import fsp from "fs/promises";
import path from "path";

export function withBigint(_key: any, value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

export class Logger {
  static instance = new Logger(
    path.join(app.getPath("userData"), "Log", `${Date.now()}.log`)
  );

  private logFilePath: string;

  private constructor(filename: string) {
    this.logFilePath = filename;
  }

  private async log(level: string, message: string) {
    try {
      const logMessage = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}\n`;
      await fsp.mkdir(path.dirname(this.logFilePath), { recursive: true });
      fsp.appendFile(this.logFilePath, logMessage);
    } catch (error) {
      if (error) {
        console.error(`Error writing to log file: ${error}`);
      }
    }
  }

  public info(message: string) {
    this.log("info", message);
  }

  public warn(message: string) {
    this.log("warn", message);
  }

  public error(message: string) {
    this.log("error", message);
  }
}

export const logger: Logger = Logger.instance;
