/**
 * Seed words for the ghost shopkeeper (see worker/ghost.ts). Five kinds, one of each is drawn at random, so that the line the
 * model writes has nothing to do with the person's problem. Written by the author. They carry no claim about anything.
 */
export interface Seed {
  en: string;
  ja: string;
}
export const ghostSeeds: { place: Seed[]; spot: Seed[]; food: Seed[]; thing: Seed[]; form: Seed[] } = {
  /** The form the line takes, so that it is not always a question. */
  form: [
    { en: "a question", ja: "疑問文" },
    { en: "an order", ja: "命令" },
    { en: "a rumor, starting with 'They say'", ja: "うわさ話(「〜らしいぜ」で終わる)" },
    { en: "a confession, in the first person", ja: "一人称の告白" },
    { en: "a flat statement of fact, said with a straight face", ja: "真顔で言い切る断定" },
    { en: "a weather report", ja: "天気予報の口調" },
    { en: "a request to a waiter", ja: "店員への注文" },
    { en: "a bedtime story opening, starting with 'Once upon a time'", ja: "昔話の出だし(「むかしむかし」で始める)" },
    { en: "a warning sign", ja: "注意書きの口調" },
    { en: "a sports commentator shouting", ja: "実況中継の口調" },
  ],
  place: [
    { en: "Brazil", ja: "ブラジル" }, { en: "Iceland", ja: "アイスランド" }, { en: "Kyoto", ja: "京都" }, { en: "Peru", ja: "ペルー" },
    { en: "Morocco", ja: "モロッコ" }, { en: "Alaska", ja: "アラスカ" }, { en: "Osaka", ja: "大阪" }, { en: "Egypt", ja: "エジプト" },
    { en: "Finland", ja: "フィンランド" }, { en: "Hawaii", ja: "ハワイ" }, { en: "Mongolia", ja: "モンゴル" }, { en: "Venice", ja: "ベネチア" },
    { en: "Mars", ja: "火星" }, { en: "Antarctica", ja: "南極" }, { en: "Okinawa", ja: "沖縄" }, { en: "Nepal", ja: "ネパール" },
    { en: "Tokyo", ja: "東京" }, { en: "Greece", ja: "ギリシャ" }, { en: "Kenya", ja: "ケニア" }, { en: "Hokkaido", ja: "北海道" },
    { en: "Cuba", ja: "キューバ" }, { en: "Sweden", ja: "スウェーデン" }, { en: "Fukuoka", ja: "福岡" }, { en: "Patagonia", ja: "パタゴニア" },
    { en: "Istanbul", ja: "イスタンブール" }, { en: "Australia", ja: "オーストラリア" }, { en: "Nara", ja: "奈良" }, { en: "Bali", ja: "バリ島" },
    { en: "the Moon", ja: "月" }, { en: "the Sahara", ja: "サハラ砂漠" }, { en: "Hiroshima", ja: "広島" }, { en: "Norway", ja: "ノルウェー" },
  ],
  spot: [
    { en: "on top of a tree", ja: "木の上" }, { en: "inside a vending machine", ja: "自動販売機の中" }, { en: "under a bridge", ja: "橋の下" },
    { en: "on a rooftop", ja: "屋上" }, { en: "in an elevator", ja: "エレベーターの中" }, { en: "on a moving train", ja: "走る電車の中" },
    { en: "at the bottom of a pool", ja: "プールの底" }, { en: "in a cave", ja: "洞窟" }, { en: "on a boat", ja: "ボートの上" },
    { en: "in a phone booth", ja: "電話ボックス" }, { en: "inside a piano", ja: "ピアノの中" }, { en: "at a bus stop", ja: "バス停" },
    { en: "in a library", ja: "図書館" }, { en: "on an escalator", ja: "エスカレーターの上" }, { en: "inside a washing machine", ja: "洗濯機の中" },
    { en: "on a ferris wheel", ja: "観覧車の中" }, { en: "in a convenience store", ja: "コンビニの中" }, { en: "inside a refrigerator", ja: "冷蔵庫の中" },
    { en: "on a bridge at midnight", ja: "真夜中の橋の上" }, { en: "in a classroom", ja: "教室" }, { en: "on a bicycle", ja: "自転車の上" },
    { en: "inside a snow globe", ja: "スノードームの中" }, { en: "on a swing", ja: "ブランコの上" }, { en: "in a bathhouse", ja: "銭湯" },
    { en: "on a mountain top", ja: "山頂" }, { en: "inside a clock tower", ja: "時計塔の中" }, { en: "in a hot spring", ja: "温泉" },
    { en: "in a parking lot", ja: "駐車場" }, { en: "under a kotatsu", ja: "こたつの中" }, { en: "inside a lighthouse", ja: "灯台の中" },
  ],
  food: [
    { en: "fried chicken", ja: "からあげ" }, { en: "melon bread", ja: "メロンパン" }, { en: "a whole pineapple", ja: "パイナップル丸ごと" },
    { en: "natto", ja: "納豆" }, { en: "hot soup", ja: "熱いスープ" }, { en: "ice cream", ja: "アイスクリーム" }, { en: "a boiled egg", ja: "ゆで卵" },
    { en: "curry", ja: "カレー" }, { en: "a rice ball", ja: "おにぎり" }, { en: "watermelon", ja: "スイカ" }, { en: "pizza", ja: "ピザ" },
    { en: "gum syrup", ja: "ガムシロップ" },
    { en: "ramen", ja: "ラーメン" }, { en: "a pickled plum", ja: "梅干し" }, { en: "tofu", ja: "豆腐" }, { en: "a hamburger", ja: "ハンバーガー" },
    { en: "takoyaki", ja: "たこ焼き" }, { en: "a banana", ja: "バナナ" }, { en: "popcorn", ja: "ポップコーン" }, { en: "soy sauce", ja: "しょうゆ" },
    { en: "cotton candy", ja: "綿あめ" }, { en: "a pudding", ja: "プリン" }, { en: "udon noodles", ja: "うどん" }, { en: "a sweet potato", ja: "焼き芋" },
    { en: "sushi", ja: "寿司" }, { en: "a lemon", ja: "レモン" }, { en: "mayonnaise", ja: "マヨネーズ" }, { en: "chocolate", ja: "チョコレート" },
    { en: "a whole cabbage", ja: "キャベツ丸ごと" }, { en: "tempura", ja: "天ぷら" }, { en: "a rice cracker", ja: "せんべい" }, { en: "jelly", ja: "ゼリー" },
  ],
  thing: [
    { en: "a trash can", ja: "ゴミ箱" }, { en: "an umbrella", ja: "傘" }, { en: "a bucket", ja: "バケツ" }, { en: "a mailbox", ja: "郵便ポスト" },
    { en: "a bicycle", ja: "自転車" }, { en: "a drum", ja: "太鼓" }, { en: "a suitcase", ja: "スーツケース" }, { en: "a ladder", ja: "はしご" },
    { en: "a mirror", ja: "鏡" }, { en: "a flowerpot", ja: "植木鉢" }, { en: "a bathtub", ja: "浴槽" }, { en: "a telescope", ja: "望遠鏡" },
    { en: "a vacuum cleaner", ja: "掃除機" }, { en: "a bell", ja: "ベル" }, { en: "a traffic cone", ja: "三角コーン" }, { en: "a guitar", ja: "ギター" },
    { en: "a rubber duck", ja: "ゴムのアヒル" }, { en: "a pair of scissors", ja: "はさみ" }, { en: "a rocking chair", ja: "ロッキングチェア" },
    { en: "a megaphone", ja: "メガホン" }, { en: "a kettle", ja: "やかん" }, { en: "a piggy bank", ja: "貯金箱" }, { en: "a hammock", ja: "ハンモック" },
    { en: "a skateboard", ja: "スケートボード" }, { en: "a lantern", ja: "ちょうちん" }, { en: "a wheelbarrow", ja: "手押し車" },
    { en: "a fishing rod", ja: "釣りざお" }, { en: "a parasol", ja: "日傘" }, { en: "a toaster", ja: "トースター" }, { en: "a snowman", ja: "雪だるま" },
    { en: "a typewriter", ja: "タイプライター" }, { en: "a scarecrow", ja: "かかし" },
  ],
};
