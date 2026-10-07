import type { Question, QuestionSet } from "../../types/question.ts";
import { summary112 } from "./112-summary.ts";

// Keep the original 191-question list available for saved-progress migration.
export const summary112LegacyQuestionIds = summary112.questions.map((question) => question.id);

const reconstructedRows: Array<{
  number: number;
  page: number;
  text: string;
  choices: [string, string, string, string];
  answer: 1 | 2 | 3 | 4;
  explanation: string;
}> = [
  {
    number: 53,
    page: 5,
    text: "販售下列何種產品之商店，可申請獲得綠色商店標誌？",
    choices: ["比便利商店還低價之產品", "溫室栽種之有機產品", "顏色為綠色之產品", "有環保或節能之綠色商品"],
    answer: 4,
    explanation: "環保署定義售有一定數量環保或節能之綠色商品，並針對該商品具有特定陳列方式之通路為「綠色商店」，經申請後核發綠色商店LOGO。",
  },
  {
    number: 68,
    page: 6,
    text: "戶外空氣污染造成多種健康危害，可能會增加下列何種病人就診次數？",
    choices: ["蚊蟲咬傷者", "消化道疾病者", "神經性疾病者", "呼吸道疾病者"],
    answer: 4,
    explanation: "戶外空氣污染是全球性的環境問題，造成多種健康危害，包括增加呼吸道和心血管疾病患者的住院與急診次數，以及多種疾病的死亡率。",
  },
  {
    number: 169,
    page: 13,
    text: "臺灣降雨量豐富，為何仍有缺水的現象，下列何者是正確的？",
    choices: ["地形陡峭，大部分的雨水都迅速地流入海洋", "降雨時空分布平均", "大部分雨水直接流入下水道", "人口不足"],
    answer: 1,
    explanation: "因為臺灣地狹人稠、山坡陡峭、雨勢集中，再加上河川短促，所以大部分的雨水都迅速地流入海洋，容易形成缺水。",
  },
  {
    number: 176,
    page: 13,
    text: "下列有關水土保持的敘述，何者「不正確」？",
    choices: ["在低窪地區大量抽取地下水，容易造成地層下陷", "在河邊棄置廢棄物，可能使下游魚類遭受影響", "在水庫上游砍伐樹木，會減少水庫的泥沙淤積", "在坡度陡峭的高山上栽植蔬果，會造成土壤流失"],
    answer: 3,
    explanation: "水土保持的方法有很多，包括種植深根植物、地下排水系統、防砂、沉砂、開挖整地、邊坡穩定、排除會倒塌的植物等等。",
  },
  {
    number: 179,
    page: 13,
    text: "下列何者「不是」土壤自淨作用？",
    choices: ["污染物進入土壤後經化學降解變為無毒害物質", "利用土壤中的微生物，將污染物由分解或轉化作用使污染物失去毒性", "土壤經過大雨沖刷能將污染物洗掉", "土壤中的污染物通過吸附等物理過程，使其濃度降低"],
    answer: 3,
    explanation: "土壤中的微生物可以將污染物經由分解或轉化作用而成為無害的無機物如二氧化碳、水等，使污染物消失於無形。",
  },
  {
    number: 181,
    page: 14,
    text: "下列何者「不是」海水溫度上升對漁業生產的衝擊？",
    choices: ["缺氧的洋流影響海洋生物存活", "漁場位移或消失", "魚群迴游路線改變", "捕撈魚類風險降低"],
    answer: 4,
    explanation: "海水溫度上升會改變海洋漁業資源種群與數量，漁場位移或消失，魚群迴游路線改變及捕撈魚類風險增加。",
  },
  {
    number: 184,
    page: 14,
    text: "下列何種因素組合容易引發沿海地區海水倒灌，造成重大氣象災害損失？",
    choices: ["梅雨、朔月", "颱風、上弦月", "梅雨、下弦月", "颱風、望月"],
    answer: 4,
    explanation: "月相為朔或望時，是最高水位的滿潮，如又遭遇颱風引起的高漲水位，容易引發海水倒灌。",
  },
  {
    number: 185,
    page: 14,
    text: "下列何者是海藻常附著在岩石表面生長的合理解釋？",
    choices: ["海藻是植物，需要葉綠體幫助其運動", "海藻能行光合作用，葉綠素與製造養分有關", "海藻可藉附著構造固定於岩石，並從海水吸收營養鹽", "海藻可增加美觀，營養鹽能使海藻保持鮮豔"],
    answer: 3,
    explanation: "海藻藉附著構造固定於岩石，並從海水中吸收營養鹽以生長。",
  },
  {
    number: 191,
    page: 14,
    text: "下列哪種行為「不符合」綠色消費的原則？",
    choices: ["注重生態保護，不影響社區環境的消費方式", "自備餐具、環保筷和購物袋", "可分解的環保塑膠袋，用完即丟棄", "做好資源回收，讓資源再利用"],
    answer: 3,
    explanation: "綠色消費，有六大原則需要遵守：減量消費（Reduce）、重複使用（Reuse）、回收再生（Recycle）、講求經濟（Economic）、符合生態（Ecological）、實踐平等（Equitable）。",
  },
];

const reconstructedQuestions: Question[] = reconstructedRows.map((row) => ({
  id: `112-summary-${String(row.number).padStart(3, "0")}`,
  number: row.number,
  text: row.text,
  choices: row.choices.map((text, index) => ({ id: (index + 1) as 1 | 2 | 3 | 4, text })),
  answer: row.answer,
  explanation: row.explanation,
  source: {
    file: summary112.sourceFile,
    page: row.page,
    kind: "pdf",
    questionLabel: String(row.number),
    images: [`/source-images/2023-summary/page-${String(row.page).padStart(2, "0")}-0.jpg`],
    note: "原稿局部缺損；部分文字依題意推測補全，非逐字原文。",
  },
}));

export const summary112Complete: QuestionSet = {
  ...summary112,
  title: "112 年－環保題目總匯",
  subtitle: "環保知識彙整題庫；局部缺損題目依題意補全",
  year: "112",
  questions: [...summary112.questions, ...reconstructedQuestions].sort((a, b) => a.number - b.number),
};
