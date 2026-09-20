const csvFile = "../../data/raw/ai_ds_job_salaries_2026.csv";
let allData = [];
fetch(csvFile)
    .then(response => {
        if (!response.ok) {
            throw new Error("ไม่สามารถโหลด CSV ได้: " + response.status);
        }
        return response.text();
    })
    .then(csvText => {
        console.log("✅ โหลด CSV สำเร็จ");
        // แปลง CSV เป็นข้อมูล
        const lines = csvText.trim().split(/\r?\n/);
        const headers = lines[0].split(",");
        allData = lines.slice(1).map(line => {
            const values = line.split(",");
            let obj = {};
            headers.forEach((header, index) => {
                obj[header.trim()] = values[index]
                    ? values[index].trim()
                    : "";
            });
            return obj;
        });
        console.log("จำนวนข้อมูล:", allData.length);
        console.log("ข้อมูลแถวแรก:", allData[0]);
        // เริ่มสร้าง Dashboard
        createDashboard(allData);
    })
    .catch(error => {
        console.error("❌ CSV ERROR:", error);
    });
// 2. สร้าง Dashboard
function createDashboard(data) {
    // แปลงข้อมูลตัวเลข
    data.forEach(d => {

        d.salary_usd = Number(d.salary_usd);
        d.years_experience = Number(d.years_experience);
        d.remote_ratio = Number(d.remote_ratio);
        d.team_size = Number(d.team_size);

    });
    // 3. Summary
    const totalJobs = data.length;

    const averageSalary =
        data.reduce((sum, d) => sum + d.salary_usd, 0) / totalJobs;

    const maxSalary =
        Math.max(...data.map(d => d.salary_usd));

    document.getElementById("totalJobs").textContent =
        totalJobs.toLocaleString();

    document.getElementById("averageSalary").textContent =
        "$" + Math.round(averageSalary).toLocaleString();

    document.getElementById("maxSalary").textContent =
        "$" + Math.round(maxSalary).toLocaleString();
    // 4. Filter
    const experienceFilter =
        document.getElementById("experienceFilter");
    const educationFilter =
        document.getElementById("educationFilter");
    const companyFilter =
        document.getElementById("companyFilter");
    // สร้างตัวเลือก Experience
    const experienceLevels =
        [...new Set(data.map(d => d.experience_level))]
        .filter(Boolean)
        .sort();
    experienceLevels.forEach(level => {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        experienceFilter.appendChild(option);
    });
    // สร้างตัวเลือก Education
    const educationLevels =
        [...new Set(data.map(d => d.education_level))]
        .filter(Boolean)
        .sort();
    educationLevels.forEach(level => {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        educationFilter.appendChild(option);
    });
    // สร้างตัวเลือก Company Size
    const companySizes =
        [...new Set(data.map(d => d.company_size))]
        .filter(Boolean)
        .sort();
    companySizes.forEach(size => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        companyFilter.appendChild(option);

    });

    // 5. Filter Function
    function updateDashboard() {
        let filteredData = data.filter(d => {
            const experienceOK =
                !experienceFilter.value ||
                d.experience_level === experienceFilter.value;
            const educationOK =
                !educationFilter.value ||
                d.education_level === educationFilter.value;
            const companyOK =
                !companyFilter.value ||
                d.company_size === companyFilter.value;
            return experienceOK &&
                   educationOK &&
                   companyOK;
        });
        console.log("ข้อมูลหลัง Filter:", filteredData.length);
        updateSummary(filteredData);
        updateCharts(filteredData);
    }
    experienceFilter.addEventListener(
        "change",
        updateDashboard
    );
    educationFilter.addEventListener(
        "change",
        updateDashboard
    );
    companyFilter.addEventListener(
        "change",
        updateDashboard
    );
  // สร้างกราฟครั้งแรก
    updateCharts(data);
}
// 6. Summary หลัง Filter
function updateSummary(data) {
    if (data.length === 0) {
        document.getElementById("totalJobs").textContent = "0";
        document.getElementById("averageSalary").textContent = "$0";
        document.getElementById("maxSalary").textContent = "$0";
        return;
    }
    const averageSalary =
        data.reduce((sum, d) => sum + d.salary_usd, 0)
        / data.length;
    const maxSalary =
        Math.max(...data.map(d => d.salary_usd));
    document.getElementById("totalJobs").textContent =
        data.length.toLocaleString();
    document.getElementById("averageSalary").textContent =
        "$" + Math.round(averageSalary).toLocaleString();
    document.getElementById("maxSalary").textContent =
        "$" + Math.round(maxSalary).toLocaleString();
}
// 7. สร้างกราฟ
let barChart;
let scatterChart;
let doughnutChart;
let lineChart;
function updateCharts(data) {
    createBarChart(data);
    createScatterChart(data);
    createDoughnutChart(data);
    createLineChart(data);
}
// 8. Bar Chart
// เงินเดือนเฉลี่ยตามตำแหน่ง
function createBarChart(data) {
    const salaryByJob = {};
    data.forEach(d => {
        if (!d.job_title) return;
        if (!salaryByJob[d.job_title]) {
            salaryByJob[d.job_title] = [];
        }
        salaryByJob[d.job_title].push(d.salary_usd);
    });
    const result = Object.entries(salaryByJob)
        .map(([job, salaries]) => {
            const avg =
                salaries.reduce((a, b) => a + b, 0)
                / salaries.length;
            return {
                job,
                avg
            };
        })
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 10);
    if (barChart) {
        barChart.destroy();
    }
    const ctx =
        document.getElementById("barChart");
    barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: result.map(d => d.job),
            datasets: [{
                label: "Average Salary (USD)",

                data: result.map(d => d.avg)
            }]
        },
        options: {
            responsive: true,
            plugins: {

                tooltip: {
                    enabled: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
// 9. Scatter Plot
// Experience vs Salary
function createScatterChart(data) {

    if (scatterChart) {
        scatterChart.destroy();
    }
    const points = data
        .filter(d =>
            !isNaN(d.years_experience) &&
            !isNaN(d.salary_usd)
        )
        .map(d => ({
            x: d.years_experience,
            y: d.salary_usd
        }));
    const ctx =
        document.getElementById("scatterChart");
    scatterChart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{

                label: "Experience vs Salary",

                data: points
            }]
        },
        options: {
            responsive: true,
            plugins: {

                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Years of Experience"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Salary (USD)"
                    }
                }
            }
        }
    });
}
// 10. Doughnut Chart
// เงินเดือนเฉลี่ยตามการศึกษา
function createDoughnutChart(data) {
    const educationSalary = {};
    data.forEach(d => {
        if (!d.education_level) return;

        if (!educationSalary[d.education_level]) {

            educationSalary[d.education_level] = [];

        }
        educationSalary[d.education_level]
            .push(d.salary_usd);
    });
    const result =
        Object.entries(educationSalary)
        .map(([education, salaries]) => {

            const avg =
                salaries.reduce((a, b) => a + b, 0)
                / salaries.length;
            return {
                education,
                avg
            };
        });
    if (doughnutChart) {
        doughnutChart.destroy();
    }
    const ctx =
        document.getElementById("doughnutChart");
    doughnutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels:
                result.map(d => d.education),
            datasets: [{
                label: "Average Salary",
                data:
                    result.map(d => d.avg)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}
// 11. Line Chart
// เงินเดือนตามช่วงประสบการณ์
function createLineChart(data) {
    const groups = {
        "0-4": [],
        "5-9": [],
        "10-14": [],
        "15-19": [],
        "20+": []
    };
    data.forEach(d => {
        const years = d.years_experience;
        if (isNaN(years)) return;

        if (years < 5) {
            groups["0-4"].push(d.salary_usd);

        } else if (years < 10) {
            groups["5-9"].push(d.salary_usd);

        } else if (years < 15) {
            groups["10-14"].push(d.salary_usd);

        } else if (years < 20) {
            groups["15-19"].push(d.salary_usd);

        } else {
            groups["20+"].push(d.salary_usd);
        }
    });
    const averages =
        Object.values(groups).map(salaries => {

            if (salaries.length === 0) {
                return 0;
            }
            return salaries.reduce((a, b) => a + b, 0)
                / salaries.length;

        });
    if (lineChart) {
        lineChart.destroy();
    }
    const ctx =
        document.getElementById("lineChart");
    lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: Object.keys(groups),
            datasets: [{
                label: "Average Salary (USD)",
                data: averages,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
function resetFilters() {
    document.getElementById("experienceFilter").value = "";
    document.getElementById("educationFilter").value = "";
    document.getElementById("companyFilter").value = "";
    location.reload();
}
