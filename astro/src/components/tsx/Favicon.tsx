import { getEmojiUrl } from "../../lib/emoji";

export default (emoji: string) => {
  return <img src={getEmojiUrl(emoji)} alt={emoji} />;
};
