type MagicLinkEmailProps = {
  clientName: string;
  freelancerName: string;
  magicLinkUrl: string;
};

export function MagicLinkEmail({
  clientName,
  freelancerName,
  magicLinkUrl,
}: MagicLinkEmailProps) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f4f6f8",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#1f2937",
        }}
      >
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          width="100%"
          style={{ backgroundColor: "#f4f6f8", padding: "24px 0" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  width="600"
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    padding: "32px 24px",
                    boxSizing: "border-box",
                  }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <p
                          style={{
                            margin: "0 0 16px",
                            fontSize: "18px",
                            lineHeight: "28px",
                            fontWeight: 600,
                          }}
                        >
                          Hi {clientName}
                        </p>

                        <p
                          style={{
                            margin: "0 0 20px",
                            fontSize: "16px",
                            lineHeight: "26px",
                          }}
                        >
                          {freelancerName} has shared your project portal with
                          you.
                        </p>

                        <p style={{ margin: "0 0 24px" }}>
                          <a
                            href={magicLinkUrl}
                            style={{
                              display: "inline-block",
                              backgroundColor: "#111827",
                              color: "#ffffff",
                              textDecoration: "none",
                              fontSize: "16px",
                              fontWeight: 600,
                              padding: "12px 20px",
                              borderRadius: "8px",
                            }}
                          >
                            View Your Portal
                          </a>
                        </p>

                        <p
                          style={{
                            margin: "0 0 12px",
                            fontSize: "14px",
                            lineHeight: "22px",
                            color: "#4b5563",
                          }}
                        >
                          This link expires in 7 days.
                        </p>

                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            lineHeight: "22px",
                            color: "#4b5563",
                            wordBreak: "break-word",
                          }}
                        >
                          If the button doesn't work, copy this link:{" "}
                          {magicLinkUrl}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
