import { json } from "@sveltejs/kit";
import { pool } from "$lib/db.js";

function formatDateJP(date) {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function GET({ url }) {
  const sensor = url.searchParams.get("sensor") ?? "frequency";
  const monthStr = url.searchParams.get("month"); // "2025-03"
  const allowed = ["frequency", "kurtosis", "temperature", "vibration"];
  if (!allowed.includes(sensor) || !monthStr) {
    return new Response("Invalid parameters", { status: 400 });
  }

  // 「YYYY」「MM」を取得
  const [y, m] = monthStr.split("-").map(Number);
  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0);

  // 日本時間の YYYY-MM-DD 文字列
  const startISO = formatDateJP(startDate); // "2025-03-01"
  const endISO = formatDateJP(endDate); // "2025-03-31"

  console.log("start:", startISO, "end:", endISO);
  // ⇒ start: 2025-03-01 end: 2025-03-31

  // SQL に文字列をそのまま渡す
  const sql = `
    WITH date_series AS (
      SELECT generate_series($1::date, $2::date, '1 day') AS day
    ),
    counts AS (
      SELECT
        reg_date::date AS day,
        COUNT(*)      AS cnt
      FROM sensor.${sensor}
      WHERE reg_date BETWEEN $1 AND $2
      GROUP BY day
    )
    SELECT
      ds.day,
      COALESCE(c.cnt, 0) AS cnt
    FROM date_series ds
    LEFT JOIN counts c ON ds.day = c.day
    ORDER BY ds.day;
  `;
  const { rows } = await pool.query(sql, [startISO, endISO]);

  const events = rows.map((r) => ({
    title: `${r.cnt}`,
    start: formatDateJP(r.day),
    allDay: true,
  }));

  console.log(events);

  return json({ events });
}
