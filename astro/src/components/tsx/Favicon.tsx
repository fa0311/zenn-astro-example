import SiteIcon from "./SiteIcon";

export default (emoji: string, radius: boolean) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        borderRadius: radius ? import.meta.env.SITE_ICON_RADIUS : 0,
        overflow: "hidden",
      }}
    >
      <SiteIcon text={emoji} />
    </div>
  );
};
