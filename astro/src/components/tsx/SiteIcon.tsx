import { getEmojiUrl } from "../../lib/emoji";

export default ({ text }: { text: string }) => {
  if (text.includes("/")) {
    return <img src={text} style={{ width: "100%", height: "100%" }} />;
  } else {
    return <img src={getEmojiUrl(text)} style={{ width: "100%", height: "100%" }} />;
  }
};
