import React from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";

const ChartCard = ({ 
  title, 
  data, 
  type = "donut", 
  height = 300,
  className 
}) => {
  const getChartOptions = () => {
    const baseOptions = {
      chart: {
        type: type,
        toolbar: { show: false },
        background: "transparent",
      },
      colors: ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#8B5CF6"],
      legend: {
        position: type === "donut" ? "bottom" : "top",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
      tooltip: {
        theme: "light",
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: "bottom"
          }
        }
      }]
    };

    if (type === "donut") {
      return {
        ...baseOptions,
        plotOptions: {
          pie: {
            donut: {
              size: "70%",
              labels: {
                show: true,
                total: {
                  show: true,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#374151",
                  formatter: function (w) {
                    const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                    return `$${total.toLocaleString()}`;
                  }
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        labels: data.labels || [],
      };
    }

    if (type === "bar") {
      return {
        ...baseOptions,
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "60%",
            borderRadius: 8,
          },
        },
        xaxis: {
          categories: data.categories || [],
          labels: {
            style: {
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            }
          }
        },
        yaxis: {
          labels: {
            formatter: function (value) {
              return `$${value.toLocaleString()}`;
            },
            style: {
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 4,
        }
      };
    }

    return baseOptions;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <Chart
        options={getChartOptions()}
        series={data.series || []}
        type={type}
        height={height}
      />
    </Card>
  );
};

export default ChartCard;