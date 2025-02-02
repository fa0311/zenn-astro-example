import SiteIcon from "./SiteIcon";

export default (emoji: string) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        borderRadius: import.meta.env.SITE_ICON_RADIUS,
        overflow: "hidden",
      }}
    >
      <SiteIcon text={emoji} />
    </div>
  );
};
