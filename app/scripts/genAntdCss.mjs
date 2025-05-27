// scripts/genAntdCss.tsx
import fs from "node:fs";
import { extractStyle } from "@ant-design/static-style-extract";

const outputPath = "./app/styles/antd.min.css";

const css = extractStyle();

fs.writeFileSync(outputPath, css);

console.log("Generated Ant Design CSS file successfully!");
