

export interface Dictionary {
  [word: string]: string;
}
const suffixRegList: RegExp[] = [];

const debugMode = false
// const debugMode = true

export function initReg() {
  if (suffixRegList.length === 0) {
  const expList = [
    "(.*?)cj$", // 厂家
    "(.*?)dd$", // 地点
    "(.*?)fzr$", // 负责人

    "(.*?)id$", // ID
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
  const lowerRawWord = rawWord.toLowerCase()
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
  console.log("转换后的词汇列表", wordList.join(","));
  }

  if (wordList.length > 1) {
    const inList: string[] = [];
    for (var w of wordList) {
      if (w.toLowerCase() in userDict) {
        inList.push(w);
      } else {
        let foundPrefix = false
        // 查看后缀匹配
        for (const r of suffixRegList) {
          if (r.test(w)) {
            const wordWithOutSuffix = w.replace(r, "$1");
            const suffix = w.replace(wordWithOutSuffix, "");
            inList.push(wordWithOutSuffix);
            inList.push(suffix);
            foundPrefix = true
            break;
          }
        }
        if (!foundPrefix) {
          // 原文输出
          inList.push(w)
        }
      }
    }
    if (inList.length > 0) {
      const retList = inList.map((w) => userDict[w]);
      return retList.join("");
    }
  } else {
    // 查看后缀匹配
    console.log("整词后缀匹配")
    const inList = [];
    for (const r of suffixRegList) {
      if (r.test(rawWord)) {
        const wordWithOutSuffix = rawWord.replace(r, "$1");
        const suffix = rawWord.replace(wordWithOutSuffix, "");
        // console.log("后缀", suffix, word, r)
        inList.push(wordWithOutSuffix);
        inList.push(suffix);
        break;
      }
    }
    if (inList.length > 0) {
      const retList = inList.map((w) => userDict[w]);
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