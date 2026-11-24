/**
 * Seed words for the ghost shopkeeper (see worker/ghost.ts). Four kinds, one of each is drawn at random, so that the line the
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
  ],
  place: [
    { en: "Brazil", ja: "ブラジル" }, { en: "Iceland", ja: "アイスランド" }, { en: "Kyoto", ja: "京都" }, { en: "Peru", ja: "ペルー" },
    { en: "Morocco", ja: "モロッコ" }, { en: "Alaska", ja: "アラスカ" }, { en: "Osaka", ja: "大阪" }, { en: "Egypt", ja: "エジプト" },
    { en: "Finland", ja: "フィンランド" }, { en: "Hawaii", ja: "ハワイ" }, { en: "Mongolia", ja: "モンゴル" }, { en: "Venice", ja: "ベネチア" },
  ],
  spot: [
    { en: "on top of a tree", ja: "木の上" }, { en: "inside a vending machine", ja: "自動販売機の中" }, { en: "under a bridge", ja: "橋の下" },
    { en: "on a rooftop", ja: "屋上" }, { en: "in an elevator", ja: "エレベーターの中" }, { en: "on a moving train", ja: "走る電車の中" },
    { en: "at the bottom of a pool", ja: "プールの底" }, { en: "in a cave", ja: "洞窟" }, { en: "on a boat", ja: "ボートの上" },
    { en: "in a phone booth", ja: "電話ボックス" }, { en: "inside a piano", ja: "ピアノの中" }, { en: "at a bus stop", ja: "バス停" },
  ],
  food: [
    { en: "fried chicken", ja: "からあげ" }, { en: "melon bread", ja: "メロンパン" }, { en: "a whole pineapple", ja: "パイナップル丸ごと" },
    { en: "natto", ja: "納豆" }, { en: "hot soup", ja: "熱いスープ" }, { en: "ice cream", ja: "アイスクリーム" }, { en: "a boiled egg", ja: "ゆで卵" },
    { en: "curry", ja: "カレー" }, { en: "a rice ball", ja: "おにぎり" }, { en: "watermelon", ja: "スイカ" }, { en: "pizza", ja: "ピザ" },
    { en: "gum syrup", ja: "ガムシロップ" },
  ],
  thing: [
    { en: "a trash can", ja: "ゴミ箱" }, { en: "an umbrella", ja: "傘" }, { en: "a bucket", ja: "バケツ" }, { en: "a mailbox", ja: "郵便ポスト" },
    { en: "a bicycle", ja: "自転車" }, { en: "a drum", ja: "太鼓" }, { en: "a suitcase", ja: "スーツケース" }, { en: "a ladder", ja: "はしご" },
    { en: "a mirror", ja: "鏡" }, { en: "a flowerpot", ja: "植木鉢" }, { en: "a bathtub", ja: "浴槽" }, { en: "a telescope", ja: "望遠鏡" },
  ],
};
