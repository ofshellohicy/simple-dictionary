// import axios from "axios";
// import * as vscode from "vscode";
export interface Dictionary {
  [word: string]: string;
}
const suffixRegList: RegExp[] = [];

const debugMode = true;
// const debugMode = true

export function initReg() {
  if (suffixRegList.length === 0) {
    const expList = [
      "(.*?)cj$", // 厂家
      "(.*?)dd$", // 地点
      "(.*?)fzr$", // 负责人

      "(.*?)id$", // ID
      "(.*?)fzr$", // ID
      "(.*?)ids$", // ID列表
      "(.*?)jz$", // 进展
      "(.*?)jd$", // 进度

      "(.*?)lx$", // 类型
      "(.*?)lb$", // 类别
      "(.*?)mlm", // 目录名
      "(.*?)mc$", // 名称
      "(.*?)ms$", // 描述
      "(.*?)nr$", // 内容
      "(.*?)nm$", // 内码

      "(.*?)sx$", // 属性
      "(.*?)sj$", // 时间
      "(.*?)sbm$", // 识别码
      "(.*?)s$", // 列表

      "(.*?)xx$", // 信息
      "(.*?)yy$", // 原因
    ];
    expList.forEach((exp) => {
      // 不区分大小写
      const r = new RegExp(exp, "i");
      suffixRegList.push(r);
    });
  }
}
export function findTips(rawWord: string, userDict: Dictionary) {
  const lowerRawWord = rawWord.toLowerCase();
  // 1. 全部转为小写查询
  if (lowerRawWord in userDict) {
    return userDict[lowerRawWord];
  }
  // 2. 驼峰转为下划线
  const wordList = [];
  for (var w of camToStr(rawWord).split("_")) {
    // Print word after splitting
    wordList.push(w.toLowerCase());
  }

  if (debugMode) {
    console.info("转换后的词汇列表", wordList.join(","));
  }

  if (wordList.length > 1) {
    if (debugMode) {
      console.info("多单词匹配", rawWord, wordList.length, wordList);
    }
    const inList: string[] = [];
    for (var w of wordList) {
      if (w.toLowerCase() in userDict) {
        if (debugMode) {
          console.info("词库匹配", w);
        }
        inList.push(userDict[w]);
      } else {
        let foundPrefix = false;
        // 查看后缀匹配
        for (const r of suffixRegList) {
          if (r.test(w)) {
            const wordWithOutSuffix = w.replace(r, "$1");
            const suffix = w.replace(wordWithOutSuffix, "");
            inList.push(upper1st(wordWithOutSuffix));
            inList.push(userDict[suffix]);
            if (debugMode) {
              console.info("匹配到suffix", suffix, w);
            }
            foundPrefix = true;
            break;
          }
        }
        if (!foundPrefix) {
          // 未匹配本地字典
          // const ts = await translate(w);
          // 必须使用language server 模式才可以async 进行通讯
          // https://github.com/microsoft/vscode-extension-samples/tree/main/lsp-sample

          const ts = "";
          const us = upper1st(w);
          if (debugMode) {
            console.info("未匹配到", upper1st(w), ts);
          }

          if (ts !== "") {
            inList.push(ts);
          } else {
            inList.push(us);
          }
        }
      }
    }
    if (inList.length > 0) {
      const retList = inList;
      return retList.join("");
    }
  } else {
    // 查看后缀匹配
    if (debugMode) {
      console.info("整词后缀匹配", rawWord);
    }
    const inList = [];
    for (const r of suffixRegList) {
      if (r.test(rawWord)) {
        const wordWithOutSuffix = rawWord.replace(r, "$1");
        const suffix = rawWord.replace(wordWithOutSuffix, "");
        // console.info("后缀", suffix, word, r)
        const prefix = userDict[wordWithOutSuffix];
        if (prefix) {
          inList.push(prefix);
        } else {
          inList.push(wordWithOutSuffix);
        }
        inList.push(userDict[suffix]);
        break;
      }
    }
    if (inList.length > 0) {
      const retList = inList;
      return retList.join("");
    }
  }
}

function camToStr(name: string) {
  var arr = name.split("");
  for (var i = 1; i < arr.length; i++) {
    if (/[A-Z]/.test(arr[i])) {
      arr[i] = "_" + arr[i].toLowerCase();
    }
  }
  return arr.join("");
}

function toCamel(str: string) {
  var re = /-(\w)/g;
  return str.replace(re, function ($0, $1) {
    return $1.toUpperCase();
  });
}

function upper1st(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}

/*
async function translate(
  source: string,
  showErrorMessage: boolean = false
): Promise<string> {
  try {
    const result = (
      await axios.get(
        `https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=${encodeURIComponent(
          source
        )}`
      )
    ).data;
    return result["translateResult"]
      .map((translateResult: any) =>
        translateResult.map((sentence: any) => sentence["tgt"]).join("")
      )
      .join("\n");
  } catch (error) {
    if (showErrorMessage) {
      if (error instanceof Error) {
        // vscode.window.showErrorMessage(error.toString());
        console.error(error.message);
      } else {
        // vscode.window.showErrorMessage("未知错误");
        console.error("未知错误");
      }
    }
  }
  return "";
}

*/
