"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const pinkPalette = ["#df7ea7", "#e791b4", "#ef9fbe", "#f3b5cd", "#f7c6d9", "#fbd8e6"];
const lavenderPalette = ["#bb8fd8", "#c8a1e0", "#d2afe6", "#dbbeeb", "#e4cdf2", "#eddcf8"];

export function AnalyticsCharts({
  viewsData,
  commentsData,
}: {
  viewsData: Array<{ title: string; views: number }>;
  commentsData: Array<{ title: string; commentsCount: number }>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="luxe-panel rounded-[30px] p-6">
        <h3 className="font-display text-3xl text-rose-950">Grafik View Konten</h3>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={viewsData} margin={{ top: 12, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3dbe5" vertical={false} />
              <XAxis
                dataKey="title"
                tick={{ fill: "#8a5c72", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                hide
              />
              <YAxis
                tick={{ fill: "#8a5c72", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(239,123,165,0.08)", stroke: "none" }}
                contentStyle={{
                  borderRadius: "22px",
                  border: "1px solid rgba(246,208,223,0.9)",
                  boxShadow: "0 18px 48px rgba(206,140,170,0.15)",
                  background: "rgba(255,252,253,0.98)",
                }}
                formatter={(value) => [`${value}`, "Views"]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="views"
                radius={[14, 14, 6, 6]}
                stroke="none"
                isAnimationActive
                activeBar={{ stroke: "none", fill: "#cf6b97" }}
              >
                {viewsData.map((_, index) => (
                  <Cell key={`view-${index}`} fill={pinkPalette[index % pinkPalette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="luxe-panel rounded-[30px] p-6">
        <h3 className="font-display text-3xl text-rose-950">Grafik Komentar</h3>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={commentsData} margin={{ top: 12, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3dbe5" vertical={false} />
              <XAxis
                dataKey="title"
                tick={{ fill: "#8a5c72", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                hide
              />
              <YAxis
                tick={{ fill: "#8a5c72", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(181,138,214,0.08)", stroke: "none" }}
                contentStyle={{
                  borderRadius: "22px",
                  border: "1px solid rgba(230,215,245,0.95)",
                  boxShadow: "0 18px 48px rgba(182,146,210,0.15)",
                  background: "rgba(255,252,253,0.98)",
                }}
                formatter={(value) => [`${value}`, "Komentar"]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="commentsCount"
                radius={[14, 14, 6, 6]}
                stroke="none"
                isAnimationActive
                activeBar={{ stroke: "none", fill: "#a87dc6" }}
              >
                {commentsData.map((_, index) => (
                  <Cell
                    key={`comment-${index}`}
                    fill={lavenderPalette[index % lavenderPalette.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
