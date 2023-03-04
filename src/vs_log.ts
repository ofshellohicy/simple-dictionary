import * as vscode from "vscode";

export let config: any = {};
export function getConfig() {
  //debug
  config.debug = vscode.workspace.getConfiguration().get("VBI.debug");
  config.debugToChannel = vscode.workspace
    .getConfiguration()
    .get("VBI.debugToChannel"); //Instead into dev-tools-console

  return config;
}

/**
 * @param cat Type String --> define Category [info,warn,error]
 * @param o   Rest Parameter, Type Any --> Data to Log
 */
export let info = vscode.window.createOutputChannel("VBI-Info");
export function log(cat: string, ...o: any) {
  function mapObject(obj: any) {
    switch (typeof obj) {
      case "undefined":
        return "undefined";

      case "string":
        return obj;

      case "number":
        return obj.toString;

      case "object":
        let ret: string = "";
        for (const [key, value] of Object.entries(obj)) {
          ret += `${key}: ${value}\n`;
        }
        return ret;

      default:
        return obj; //function,symbol,boolean
    }
  }

  if (config.debug) {
    if (config.debugToChannel) {
      switch (cat.toLowerCase()) {
        case "info":
          info.appendLine("INFO:");
          o.map((args: any) => {
            info.appendLine("" + mapObject(args));
          });
          info.show();
          return;

        case "warn":
          info.appendLine("WARN:");
          o.map((args: any) => {
            info.appendLine("" + mapObject(args));
          });
          info.show();
          return;

        case "error":
          let err: string = "";
          info.appendLine("ERROR: ");
          //err += mapObject(cat) + ": \r\n";
          o.map((args: any) => {
            err += mapObject(args);
          });
          info.appendLine(err);
          vscode.window.showErrorMessage(err); //.replace(/(\r\n|\n|\r)/gm,"")
          info.show();
          return;

        default:
          info.appendLine("INFO-Other:");
          info.appendLine(mapObject(cat));
          o.map((args: any) => {
            info.appendLine("" + mapObject(args));
          });
          info.show();
          return;
      }
    } else {
      switch (cat.toLowerCase()) {
        case "info":
          console.log("INFO:", o);
          return;
        case "warn":
          console.log("WARNING:", o);
          return;
        case "error":
          console.log("ERROR:", o);
          return;
        default:
          console.log("log:", cat, o);
          return;
      }
    }
  }
}
