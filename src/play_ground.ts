import { findTips, initReg, Dictionary } from "./algo";
// 测试算法

import * as readline from "readline";
import * as fs from "fs";

const makeTestDict = () => {
  const dictPathStr = "/Users/jiaweiyang/my_simple-dict.tsv";

  const userDict: Dictionary = {};
  const dictPathStrList = dictPathStr.split(",");

  for (const dictPathStr of dictPathStrList) {
    console.log("加载字典", dictPathStr);
    const stream = fs.createReadStream(dictPathStr);
    const reader = readline.createInterface({ input: stream });

    reader.on("line", (row: string) => {
      const [word, meaning] = row.split("\t");
      // 默认小写匹配
      userDict[word.toLowerCase()] = meaning;
      // console.log("加载字典", word);
    });
    // 读取完字典后执行测试
    reader.on("close", test);
  }

  return userDict;
};

let userDict: Dictionary = makeTestDict();

initReg();

function test() {
  console.log("userDict size", Object.keys(userDict).length);
  let ss = ["zlwtxxnm", "zlwtJd", "zlwtjd"];
  ss.forEach((s) => {
    let o = findTips(s, userDict);
    console.log(s, o);
  });
}
