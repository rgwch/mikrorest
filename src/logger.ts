/************************************************
 * This file is part of the CheckAlive project
 * Copyright (c) 2025
 * License: MIT
 ************************************************/
import fs from 'fs'
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3
}

export class Logger {
  public logLevel: LogLevel = (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "debug") ? LogLevel.DEBUG : LogLevel.WARNING
  private outfile: string | null = null

  private output(message: string): void {
    if (this.outfile) {
      fs.appendFile(this.outfile, new Date().toLocaleString() + " - " + message + "\n", (err) => {
        if (err) {
          console.log("can't write to log file")
        }
      })
    } else {
      console.log(new Date().toLocaleString() + " - " + message)
    }
  }

  public setOutput(out: string) {
    if (out) {
      this.outfile = out
    } else {
      this.outfile = null
    }
  }
  public debug(...message: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.output(`DEBUG: ${message.join(" ")}`);
    }
  }

  public info(...message: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      this.output(`INFO: ${message}`);
    }
  }

  public warning(...message: any[]): void {
    if (this.logLevel <= LogLevel.WARNING) {
      this.output(`WARNING: ${message}`);
    }
  }

  public error(...message: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      this.output(`ERROR: ${message}`);
    }
  }
  public fatal(message: string): void {
    this.output(`FATAL: ${message}`);
    process.exit(1);
  }
}

export const logger = new Logger();
