// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";

import {initReg, Dictionary, findTips} from "./algo"

const makeAbsPaths = (dictPathStr: string) => {
  if (fs.existsSync(dictPathStr)) {
    return dictPathStr;
  }
  if (vscode.workspace.workspaceFolders === undefined) {
    return dictPathStr;
  }
  const workspaceRoot = vscode.workspace.workspaceFolders[0];
  return path.join(workspaceRoot.uri.path, dictPathStr);
};

const makeDict = () => {
  const config = vscode.workspace.getConfiguration("simple-dictionary");
  const dictPathStr = config.dictPaths;
  if (dictPathStr === "") {
    return {} as Dictionary;
  }

  const globalUserDict: Dictionary = {};
  const dictPathStrList = dictPathStr.split(",");

  for (const dictPathStr of dictPathStrList) {
    const stream = fs.createReadStream(makeAbsPaths(dictPathStr));
    const reader = readline.createInterface({ input: stream });

    reader.on("line", (row: string) => {
      const [word, meaning] = row.split("\t");
      globalUserDict[word] = meaning;
    });
  }

  return globalUserDict;
};

let globalUserDict: Dictionary = makeDict();



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "simple-dictionary" is now active!'
  );
  initReg();
  vscode.window.showInformationMessage("自定义字典插件加载成功");

  // 定义操作
  const command = "extension.reloadDict";

  const commandHandler = (args: any[]) => {
    globalUserDict = makeDict();
    console.log("重新加载字典", args);
    vscode.window.showInformationMessage("重新加载字典完成!");
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(command, commandHandler)
  );

  // 定义hover处理
  const disposable = vscode.languages.registerHoverProvider(["*"], {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);

      const tip = findTips(word, globalUserDict);
      if (tip) {
        return new vscode.Hover({
          language: "",
          value: tip,
        });
      }

      /*
      // 全部转为小写查询
      if (word.toLowerCase() in userDict) {
        return new vscode.Hover({
          language: "",
          value: userDict[word],
        });
      }
      // 小写组合词问题：
      const wordList = [];
      for (var w of camToStr(word).split("_")) {
        // Print word after splitting
        wordList.push(w.toLowerCase());
      }
      console.log(wordList.join(","));

      if (wordList.length > 1) {
        const inList: string[] = [];
        for (var w of wordList) {
          if (w.toLowerCase() in userDict) {
            inList.push(w);
          } else {
            // 查看后缀匹配
            for (const r of suffixRegList) {
              if (r.test(w)) {
                const wordWithOutSuffix = w.replace(r, "$1");
                const suffix = w.replace(r, "$2");
                inList.push(wordWithOutSuffix);
                inList.push(suffix);
                break;
              }
            }
          }
        }
        if (inList.length > 0) {
          const retList = inList.map((w) => userDict[w]);
          return new vscode.Hover({
            language: "",
            value: retList.join("->"),
          });
        }
      } else {
        // 查看后缀匹配
        const inList = []
        for (const r of suffixRegList) {
          if (r.test(word)) {
            const wordWithOutSuffix = word.replace(r, "$1");
            const suffix = word.replace(r, "$2");
            inList.push(wordWithOutSuffix);
            inList.push(suffix);
            break;
          }
        } 
        if (inList.length > 0) {
          const retList = inList.map((w) => userDict[w]);
          return new vscode.Hover({
            language: "",
            value: retList.join("->"),
          });
        }
      }
      */
    },
  });

  context.subscriptions.push(disposable);
}
