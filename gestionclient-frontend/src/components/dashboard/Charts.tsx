"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui";

// ─── Donut Chart ───
interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  delay?: number;
}

export function DonutChart({ data, title, delay = 0 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full">
        <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
        <div className="flex items-center gap-6">
          <div className="w-36 h-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 flex-1">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-text-secondary">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{item.value}</span>
                  <span className="text-[10px] text-text-muted">
                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Bar Chart ───
interface BarChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  delay?: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg px-3 py-2 text-xs">
        <p className="text-text-secondary">{label}</p>
        <p className="text-text-primary font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function BarChartWidget({ data, title, delay = 0 }: BarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full">
        <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#8888AA", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8888AA", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(108,99,255,0.05)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
