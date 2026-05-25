const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TabStopType, TabStopPosition
} = require("docx");

// === Style definitions matching the user's existing document ===

const FONT = "Arial";
const PAGE_W = 11906; // A4
const PAGE_H = 16838;
const MARGIN = 1440; // 1 inch

const COLOR_BLACK = "1A1A1A";
const COLOR_BLUE = "2B579A";
const COLOR_DARK = "333333";
const COLOR_GRAY = "666666";
const COLOR_WHITE = "FFFFFF";
const COLOR_BORDER = "AAAAAA";
const COLOR_LINK = "0563C1";

// H1: 18pt bold black
const H1_SIZE = 36;
// H2: 15pt bold blue
const H2_SIZE = 30;
// H3: 13pt bold dark
const H3_SIZE = 26;
// body: 12pt
const BODY_SIZE = 24;

// Table header cell helper
function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    },
    shading: { fill: COLOR_BLUE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: COLOR_WHITE })],
    })],
  });
}

function bodyCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: FONT, size: BODY_SIZE })],
    })],
  });
}

// Simple table: header row + one data row with placeholders
function placeholderTable(col1, col2, col1W, col2W) {
  return new Table({
    width: { size: col1W + col2W, type: WidthType.DXA },
    columnWidths: [col1W, col2W],
    rows: [
      new TableRow({ children: [headerCell(col1, col1W), headerCell(col2, col2W)] }),
      new TableRow({ children: [bodyCell("[填写]", col1W), bodyCell("[填写]", col2W)] }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT, size: H1_SIZE, bold: true, color: COLOR_BLACK })],
    spacing: { before: 360, after: 200 },
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT, size: H2_SIZE, bold: true, color: COLOR_BLUE })],
    spacing: { before: 280, after: 160 },
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: FONT, size: H3_SIZE, bold: true, color: COLOR_DARK })],
    spacing: { before: 200, after: 120 },
  });
}

function bodyPara(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: FONT, size: BODY_SIZE, color: COLOR_DARK })],
  });
}

function boldPara(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: FONT, size: BODY_SIZE, bold: true, color: COLOR_DARK })],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

// ====== Document ======

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: BODY_SIZE },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H1_SIZE, bold: true, font: FONT, color: COLOR_BLACK },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H2_SIZE, bold: true, font: FONT, color: COLOR_BLUE },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H3_SIZE, bold: true, font: FONT, color: COLOR_DARK },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "●", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "○", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        ],
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ],
      },
    ],
  },
  sections: [
    // ====== Section 1: Cover page ======
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: "技术总结笔记", font: FONT, size: 18, color: COLOR_GRAY })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", font: FONT, size: 18, color: COLOR_GRAY }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: COLOR_GRAY })],
          })],
        }),
      },
      children: [
        // Spacer
        new Paragraph({ spacing: { before: 4800 }, children: [] }),
        // Title
        new Paragraph({
          spacing: { after: 400 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "[项目名称]", font: FONT, size: 56, bold: true, color: COLOR_BLACK })],
        }),
        new Paragraph({
          spacing: { after: 400 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "技术总结笔记", font: FONT, size: 56, bold: true, color: COLOR_BLACK })],
        }),
        // Subtitle
        new Paragraph({
          spacing: { before: 600, after: 200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "—— [使用的工具链/技术栈]", font: FONT, size: BODY_SIZE, color: COLOR_GRAY })],
        }),
        new Paragraph({
          spacing: { before: 200, after: 200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "[一句话描述项目目标]", font: FONT, size: BODY_SIZE, color: COLOR_GRAY })],
        }),
        // Author info
        new Paragraph({ spacing: { before: 1200 }, children: [] }),
        new Paragraph({
          spacing: { after: 120 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "作者：[姓名]", font: FONT, size: BODY_SIZE, color: COLOR_DARK })],
        }),
        new Paragraph({
          spacing: { after: 120 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "日期：[YYYY年M月D日]", font: FONT, size: BODY_SIZE, color: COLOR_DARK })],
        }),
        new Paragraph({
          spacing: { after: 120 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "适用对象：[目标读者]", font: FONT, size: BODY_SIZE, color: COLOR_DARK })],
        }),
      ],
    },

    // ====== Section 2: TOC + Content ======
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: "技术总结笔记", font: FONT, size: 18, color: COLOR_GRAY })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", font: FONT, size: 18, color: COLOR_GRAY }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: COLOR_GRAY })],
          })],
        }),
      },
      children: [
        // TOC
        heading1("目录"),
        bodyPara("[目录由 Word 自动生成，打开此文件后右键目录 → 更新域 → 更新整个目录]"),
        emptyLine(),

        // ========== Chapter 1 ==========
        heading1("1. 项目概述"),
        heading2("1.1 项目名称"),
        bodyPara("[填写项目的正式名称]"),
        emptyLine(),

        heading2("1.2 项目目标"),
        bodyPara("[用一段话描述这个项目要做什么、解决什么问题]"),
        emptyLine(),

        heading2("1.3 项目背景"),
        bodyPara("[为什么要做这个项目？有什么应用场景？]"),
        emptyLine(),

        heading2("1.4 关键信息表"),
        // Info table
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [1800, 7226],
          rows: [
            new TableRow({ children: [headerCell("项目", 1800), headerCell("描述", 7226)] }),
            new TableRow({ children: [bodyCell("项目名称", 1800), bodyCell("[填写]", 7226)] }),
            new TableRow({ children: [bodyCell("所属方向", 1800), bodyCell("[填写]", 7226)] }),
            new TableRow({ children: [bodyCell("开始日期", 1800), bodyCell("[填写]", 7226)] }),
            new TableRow({ children: [bodyCell("完成日期", 1800), bodyCell("[填写]", 7226)] }),
            new TableRow({ children: [bodyCell("参考来源", 1800), bodyCell("[填写]", 7226)] }),
          ],
        }),
        emptyLine(),

        // ========== Chapter 2 ==========
        heading1("2. 软件环境与版本"),
        bodyPara("以下为项目所使用的软件环境，请确保所有依赖按版本号精确安装。"),
        emptyLine(),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3000, 2000, 3026],
          rows: [
            new TableRow({ children: [headerCell("软件/库", 3000), headerCell("版本", 2000), headerCell("用途", 3026)] }),
            new TableRow({ children: [bodyCell("[例如：Python]", 3000), bodyCell("[3.10.11]", 2000), bodyCell("[编程语言]", 3026)] }),
            new TableRow({ children: [bodyCell("[例如：MATLAB]", 3000), bodyCell("[R2023b]", 2000), bodyCell("[仿真计算]", 3026)] }),
            new TableRow({ children: [bodyCell("[添加更多行...]", 3000), bodyCell("", 2000), bodyCell("", 3026)] }),
          ],
        }),
        emptyLine(),

        heading2("2.1 环境配置步骤"),
        bodyPara("按以下步骤配置环境（每一步请替换为实际命令）："),
        emptyLine(),
        boldPara("步骤 1：[例如：安装 Python 3.10]"),
        bodyPara("```bash\n# [安装命令]\n```"),
        emptyLine(),
        boldPara("步骤 2：[例如：安装依赖库]"),
        bodyPara("```bash\n# [安装命令]\n```"),
        emptyLine(),
        boldPara("步骤 3：[验证安装]"),
        bodyPara("```bash\n# [验证命令]\n```"),
        emptyLine(),

        // ========== Chapter 3 ==========
        heading1("3. 项目结构说明"),
        bodyPara("以下为项目的目录结构，说明每个文件和文件夹的作用。"),
        emptyLine(),

        bodyPara("```\n项目名/\n├── src/           # [源代码]\n├── data/          # [数据文件]\n├── config/        # [配置文件]\n├── output/        # [输出结果]\n└── README.md      # [说明文档]\n```"),
        emptyLine(),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3000, 6026],
          rows: [
            new TableRow({ children: [headerCell("文件/目录", 3000), headerCell("作用", 6026)] }),
            new TableRow({ children: [bodyCell("[文件路径]", 3000), bodyCell("[说明]", 6026)] }),
            new TableRow({ children: [bodyCell("[添加更多行...]", 3000), bodyCell("", 6026)] }),
          ],
        }),
        emptyLine(),

        // ========== Chapter 4 ==========
        heading1("4. 代码开发步骤"),
        bodyPara("按开发顺序记录每一步做了什么、为什么这样做。"),
        emptyLine(),

        heading2("步骤 1：[名称]"),
        boldPara("做了什么："),
        bodyPara("[描述这一步做了什么]"),
        boldPara("为什么这样做："),
        bodyPara("[说明原因和考虑]"),
        boldPara("关键代码："),
        bodyPara("```python\n# [代码片段]\n```"),
        boldPara("参考来源："),
        bodyPara("[相关的教程、文档、论文链接]"),
        emptyLine(),

        heading2("步骤 2：[名称]"),
        boldPara("做了什么："),
        bodyPara("[填写]"),
        boldPara("为什么这样做："),
        bodyPara("[填写]"),
        boldPara("关键代码："),
        bodyPara("```\n# [代码片段]\n```"),
        boldPara("参考来源："),
        bodyPara("[填写]"),
        emptyLine(),

        bodyPara("[按需添加更多步骤...]"),
        emptyLine(),

        // ========== Chapter 5 ==========
        heading1("5. 编程调试流程"),
        bodyPara("从零开始搭建环境 → 运行代码 → 看到结果的完整流程。每一步的命令和预期输出都必须写清楚。"),
        emptyLine(),

        heading2("5.1 完整运行流程"),
        boldPara("1. 进入项目目录"),
        bodyPara("```bash\ncd [项目路径]\n```"),
        emptyLine(),
        boldPara("2. 运行主程序"),
        bodyPara("```bash\n[运行命令]\n```"),
        emptyLine(),
        boldPara("3. 预期输出"),
        bodyPara("```\n[预期输出内容]\n```"),
        emptyLine(),

        heading2("5.2 常见报错与处理"),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2500, 2500, 4026],
          rows: [
            new TableRow({ children: [headerCell("报错信息", 2500), headerCell("原因", 2500), headerCell("解决方法", 4026)] }),
            new TableRow({ children: [bodyCell("[例如：ModuleNotFoundError]", 2500), bodyCell("[缺少依赖]", 2500), bodyCell("[pip install xxx]", 4026)] }),
            new TableRow({ children: [bodyCell("[添加更多行...]", 2500), bodyCell("", 2500), bodyCell("", 4026)] }),
          ],
        }),
        emptyLine(),

        // ========== Chapter 6 ==========
        heading1("6. 运行说明"),
        bodyPara("让一个完全没接触过这个项目的人能够按照以下说明跑通项目。"),
        emptyLine(),

        heading2("6.1 启动方式"),
        bodyPara("[双击运行 / 命令行运行 / IDE 运行 —— 选一个并详细说明]"),
        emptyLine(),

        heading2("6.2 输入要求"),
        bodyPara("[需要哪些输入文件？格式是什么？放在哪个目录？]"),
        emptyLine(),

        heading2("6.3 预期输出"),
        bodyPara("[运行后应该看到什么？附期待结果的描述或截图标记]"),
        emptyLine(),

        heading2("6.4 运行时间"),
        bodyPara("[大约需要多长时间完成一次完整运行]"),
        emptyLine(),

        heading2("6.5 可靠性测试记录"),
        bodyPara("以下为代码文件开头应包含的可靠性测试注释（在代码文件开头以注释形式写入）："),
        emptyLine(),
        bodyPara("```\n## 可靠性测试记录\n# 1. 连续运行 [N] 分钟无报错\n# 2. 测试了 [X/Y/Z] 三种输入情况，输出均符合预期\n# 3. 反复启停 [N] 次无异常\n# 4. 测试了边界情况：空输入、超长输入、特殊字符输入\n```"),
        emptyLine(),

        // ========== Chapter 7 ==========
        heading1("7. 参考链接"),
        bodyPara("所有参考过的教程、文档、博客、论文，每个链接旁边注明它解决了什么问题。"),
        emptyLine(),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3500, 5526],
          rows: [
            new TableRow({ children: [headerCell("链接", 3500), headerCell("解决了什么问题", 5526)] }),
            new TableRow({ children: [bodyCell("[教程/文档标题](URL)", 3500), bodyCell("[帮助理解了 xxx 部分]", 5526)] }),
            new TableRow({ children: [bodyCell("[论文标题](URL)", 3500), bodyCell("[提供了 xxx 方法的理论基础]", 5526)] }),
            new TableRow({ children: [bodyCell("[添加更多行...]", 3500), bodyCell("", 5526)] }),
          ],
        }),
        emptyLine(),

        // Final note
        new Paragraph({
          spacing: { before: 400 },
          children: [new TextRun({
            text: "—— 文档结束 ——",
            font: FONT, size: BODY_SIZE, color: COLOR_GRAY, italics: true,
          })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    },
  ],
});

// ====== Generate ======

Packer.toBuffer(doc).then(buffer => {
  const outPath = __dirname + "/技术总结笔记模板.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Template created: " + outPath);
});
