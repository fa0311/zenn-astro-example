import SiteIcon from "./SiteIcon";

export default (title: string) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        background: "linear-gradient(90deg, #5CC3FF 0%, #9595EA 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          borderRadius: "15px",
          boxShadow: "5px 5px 10px #00000044",
          flexDirection: "column",
          padding: "35px 45px",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: "70px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          {title}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <p
            style={{
              fontSize: "40px",
              color: "#333",
              fontWeight: "bold",
            }}
          >
            {import.meta.env.SITE_AUTHOR_NAME}
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "70px",
                height: "70px",
                marginRight: "10px",
                borderRadius: import.meta.env.SITE_ICON_RADIUS,
                overflow: "hidden",
              }}
            >
              {SiteIcon({ text: import.meta.env.SITE_ICON })}
            </div>
            <p
              style={{
                fontSize: "60px",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              {import.meta.env.SITE_NAME}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
