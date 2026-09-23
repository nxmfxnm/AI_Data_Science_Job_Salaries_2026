/* =====================================================
   AI & DATA SCIENCE JOB SALARIES 2026
   CHART.JS VERSION
===================================================== */

const csvFile = "../../data/raw/ai_ds_job_salaries_2026.csv";

let allData = [];


/* =====================================================
   1. LOAD CSV
===================================================== */

fetch(csvFile)

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "ไม่สามารถโหลด CSV ได้: " +
                response.status
            );

        }

        return response.text();

    })

    .then(csvText => {

        console.log("✅ โหลด CSV สำเร็จ");

        const lines =
            csvText.trim().split(/\r?\n/);

        const headers =
            lines[0].split(",");


        allData =
            lines.slice(1).map(line => {

                const values =
                    line.split(",");

                let obj = {};

                headers.forEach(
                    (header, index) => {

                        obj[header.trim()] =
                            values[index]
                                ? values[index].trim()
                                : "";

                    }
                );

                return obj;

            });


        console.log(
            "จำนวนข้อมูล:",
            allData.length
        );

        console.log(
            "ข้อมูลแถวแรก:",
            allData[0]
        );


        createDashboard(allData);

    })

    .catch(error => {

        console.error(
            "❌ CSV ERROR:",
            error
        );

    });


/* =====================================================
   2. CREATE DASHBOARD
===================================================== */

function createDashboard(data) {


    /* =========================
       แปลงข้อมูลตัวเลข
    ========================= */

    data.forEach(d => {

        d.salary_usd =
            Number(d.salary_usd);

        d.years_experience =
            Number(d.years_experience);

        d.remote_ratio =
            Number(d.remote_ratio);

        d.team_size =
            Number(d.team_size);

    });



    /* =========================
       SUMMARY
    ========================= */

    updateSummary(data);



    /* =========================
       FILTER
    ========================= */

    const experienceFilter =
        document.getElementById(
            "experienceFilter"
        );

    const educationFilter =
        document.getElementById(
            "educationFilter"
        );

    const companyFilter =
        document.getElementById(
            "companyFilter"
        );



    /* Experience Level */

    const experienceLevels =
        [
            ...new Set(
                data.map(
                    d => d.experience_level
                )
            )
        ]
        .filter(Boolean)
        .sort();


    experienceLevels.forEach(level => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            level;

        option.textContent =
            level;

        experienceFilter
            .appendChild(option);

    });



    /* Education Level */

    const educationLevels =
        [
            ...new Set(
                data.map(
                    d => d.education_level
                )
            )
        ]
        .filter(Boolean)
        .sort();


    educationLevels.forEach(level => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            level;

        option.textContent =
            level;

        educationFilter
            .appendChild(option);

    });



    /* Company Size */

    const companySizes =
        [
            ...new Set(
                data.map(
                    d => d.company_size
                )
            )
        ]
        .filter(Boolean)
        .sort();


    companySizes.forEach(size => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            size;

        option.textContent =
            size;

        companyFilter
            .appendChild(option);

    });



    /* =================================================
       UPDATE DASHBOARD AFTER FILTER
    ================================================= */

    function updateDashboard() {

        const filteredData =
            data.filter(d => {

                const experienceOK =

                    !experienceFilter.value ||

                    d.experience_level ===
                    experienceFilter.value;


                const educationOK =

                    !educationFilter.value ||

                    d.education_level ===
                    educationFilter.value;


                const companyOK =

                    !companyFilter.value ||

                    d.company_size ===
                    companyFilter.value;


                return (
                    experienceOK &&
                    educationOK &&
                    companyOK
                );

            });


        console.log(
            "ข้อมูลหลัง Filter:",
            filteredData.length
        );


        updateSummary(
            filteredData
        );

        updateCharts(
            filteredData
        );

    }



    experienceFilter
        .addEventListener(
            "change",
            updateDashboard
        );


    educationFilter
        .addEventListener(
            "change",
            updateDashboard
        );


    companyFilter
        .addEventListener(
            "change",
            updateDashboard
        );



    /* สร้างกราฟครั้งแรก */

    updateCharts(data);

}


/* =====================================================
   3. SUMMARY CARDS
===================================================== */

function updateSummary(data) {


    if (data.length === 0) {

        document.getElementById(
            "totalJobs"
        ).textContent = "0";

        document.getElementById(
            "averageSalary"
        ).textContent = "$0";

        document.getElementById(
            "minSalary"
        ).textContent = "$0";

        document.getElementById(
            "maxSalary"
        ).textContent = "$0";

        return;

    }


    const salaries =
        data
            .map(d => d.salary_usd)
            .filter(Number.isFinite);


    const averageSalary =

        salaries.reduce(
            (sum, value) =>
                sum + value,
            0
        ) / salaries.length;


    const minSalary =
        Math.min(...salaries);


    const maxSalary =
        Math.max(...salaries);



    document.getElementById(
        "totalJobs"
    ).textContent =
        data.length.toLocaleString();


    document.getElementById(
        "averageSalary"
    ).textContent =
        "$" +
        Math.round(
            averageSalary
        ).toLocaleString();


    document.getElementById(
        "minSalary"
    ).textContent =
        "$" +
        Math.round(
            minSalary
        ).toLocaleString();


    document.getElementById(
        "maxSalary"
    ).textContent =
        "$" +
        Math.round(
            maxSalary
        ).toLocaleString();

}


/* =====================================================
   4. CHART VARIABLES
===================================================== */

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


/* =====================================================
   5. GRAPH 1
   HORIZONTAL BAR CHART
   เงินเดือนเฉลี่ยตามตำแหน่งงาน
===================================================== */

function createBarChart(data) {


    const salaryByJob = {};


    data.forEach(d => {

        if (
            !d.job_title ||
            !Number.isFinite(
                d.salary_usd
            )
        ) {
            return;
        }


        if (
            !salaryByJob[
                d.job_title
            ]
        ) {

            salaryByJob[
                d.job_title
            ] = [];

        }


        salaryByJob[
            d.job_title
        ].push(
            d.salary_usd
        );

    });



    const result =

        Object.entries(
            salaryByJob
        )

        .map(
            ([job, salaries]) => {

                const avg =

                    salaries.reduce(
                        (a, b) =>
                            a + b,
                        0
                    )

                    / salaries.length;


                return {

                    job: job,

                    avg: avg

                };

            }
        )

        .sort(
            (a, b) =>
                b.avg - a.avg
        )

        .slice(
            0,
            10
        );



    if (barChart) {

        barChart.destroy();

    }



    const ctx =
        document.getElementById(
            "barChart"
        );



    const barColors = [

        "#7db9d6",
        "#9b8ae0",
        "#f59e8b",
        "#70c1b3",
        "#f6c85f",
        "#6f9ceb",
        "#b8a1d9",
        "#84c7ae",
        "#f3a683",
        "#95a5d6"

    ];



    barChart =
        new Chart(
            ctx,
            {

                type: "bar",


                data: {

                    labels:

                        result.map(
                            d => d.job
                        ),


                    datasets: [

                        {

                            label:
                                "Average Salary (USD)",


                            data:

                                result.map(
                                    d => d.avg
                                ),


                            backgroundColor:
                                barColors,


                            borderColor:
                                barColors,


                            borderWidth: 1,


                            borderRadius: 7,


                            barPercentage:
                                0.75

                        }

                    ]

                },


                options: {

                    /* สำคัญ:
                       ทำให้ Bar เป็นแนวนอน */

                    indexAxis: "y",


                    responsive: true,


                    maintainAspectRatio:
                        false,


                    animation: {

                        duration: 1000,

                        easing:
                            "easeOutQuart"

                    },


                    plugins: {

                        legend: {

                            display:
                                false

                        },


                        tooltip: {

                            enabled:
                                true,


                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            "Average Salary: $" +
                                            Math.round(
                                                context.raw
                                            )
                                            .toLocaleString()
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            beginAtZero:
                                true,


                            title: {

                                display:
                                    true,

                                text:
                                    "Average Salary (USD)"

                            },


                            ticks: {

                                callback:
                                    function(value) {

                                        return (
                                            "$" +
                                            value
                                            .toLocaleString()
                                        );

                                    }

                            }

                        },


                        y: {

                            grid: {

                                display:
                                    false

                            }

                        }

                    }

                }

            }
        );

}

/* =====================================================
   GRAPH 2 : BUBBLE CHART
   ความสัมพันธ์ระหว่างประสบการณ์กับเงินเดือน
===================================================== */

function createScatterChart(data) {

    if (scatterChart) {
        scatterChart.destroy();
    }

    const points = data
        .filter(d =>
            Number.isFinite(d.years_experience) &&
            Number.isFinite(d.salary_usd)
        )
        .map(d => ({

            // แกน X = ประสบการณ์
            x: d.years_experience,

            // แกน Y = เงินเดือน
            y: d.salary_usd,

            // ขนาด Bubble
            // ใช้ team_size ถ้ามีข้อมูล
            r: 5 + Math.min(
                Number.isFinite(d.team_size)
                    ? d.team_size
                    : 0,
                10
            ) * 0.5,

            // เก็บข้อมูลไว้แสดง Tooltip
            job_title: d.job_title,
            experience_level: d.experience_level,
            education_level: d.education_level,
            company_size: d.company_size

        }));


    const ctx =
        document.getElementById("scatterChart");


    scatterChart = new Chart(ctx, {

        type: "bubble",

        data: {

            datasets: [{

                label: "Experience vs Salary",

                data: points,

                backgroundColor:
                    "rgba(245, 158, 139, 0.55)",

                borderColor:
                    "#e47d68",

                borderWidth: 1.5,

                hoverBackgroundColor:
                    "rgba(155, 138, 224, 0.8)",

                hoverBorderColor:
                    "#765ac7",

                hoverBorderWidth: 2

            }]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,


            animation: {

                duration: 1200,

                easing: "easeOutQuart"

            },


            interaction: {

                mode: "nearest",

                intersect: true

            },


            plugins: {

                legend: {
                    display: false
                },


                tooltip: {

                    enabled: true,

                    callbacks: {

                        title: function(context) {

                            const point =
                                context[0].raw;

                            return point.job_title ||
                                "Job Information";

                        },
                        label: function(context) {

                            const point =
                                context.raw;

                            return [

                                "ประสบการณ์: " +
                                point.x +
                                " ปี",

                                "เงินเดือน: $" +
                                Math.round(point.y)
                                    .toLocaleString(),

                                "ระดับ: " +
                                (point.experience_level || "-"),

                                "การศึกษา: " +
                                (point.education_level || "-"),

                                "ขนาดบริษัท: " +
                                (point.company_size || "-")

                            ];

                        }

                    }

                }

            },


            scales: {

                x: {

                    beginAtZero: true,

                    title: {

                        display: true,

                        text:
                            "ประสบการณ์การทำงาน (ปี)"

                    },

                    grid: {

                        color:
                            "rgba(0,0,0,0.05)"

                    }

                },


                y: {

                    beginAtZero: true,

                    title: {

                        display: true,

                        text:
                            "เงินเดือน (USD)"

                    },

                    ticks: {

                        callback:
                            function(value) {

                                return "$" +
                                    value.toLocaleString();

                            }

                    },

                    grid: {

                        color:
                            "rgba(0,0,0,0.05)"

                    }

                }

            }

        }

    });

}
/* =====================================================
   7. GRAPH 3
   POLAR AREA CHART
   เงินเดือนเฉลี่ยตามระดับการศึกษา
===================================================== */
function createDoughnutChart(data) {
    const educationSalary =
        {};
    data.forEach(d => {
        if (
            !d.education_level ||
            !Number.isFinite(
                d.salary_usd
            )
        ) {

            return;

        }
        if (
            !educationSalary[
                d.education_level
            ]
        ) {
            educationSalary[
                d.education_level
            ] = [];
        }
        educationSalary[
            d.education_level
        ].push(
            d.salary_usd
        );
    });
    const result =
        Object.entries(
            educationSalary
        )

        .map(
            (
                [
                    education,
                    salaries
                ]
            ) => {


                const avg =

                    salaries.reduce(
                        (a, b) =>
                            a + b,
                        0
                    )

                    / salaries.length;


                return {

                    education:
                        education,

                    avg:
                        avg

                };

            }
        );



    if (doughnutChart) {

        doughnutChart.destroy();

    }



    const ctx =
        document.getElementById(
            "doughnutChart"
        );



    doughnutChart =
        new Chart(
            ctx,
            {

                type:
                    "polarArea",


                data: {

                    labels:

                        result.map(
                            d =>
                                d.education
                        ),


                    datasets: [

                        {

                            label:
                                "Average Salary",


                            data:

                                result.map(
                                    d => d.avg
                                ),


                            backgroundColor: [

                                "rgba(255,154,162,0.72)",

                                "rgba(255,183,178,0.72)",

                                "rgba(255,218,193,0.72)",

                                "rgba(181,234,215,0.72)",

                                "rgba(199,206,234,0.72)",

                                "rgba(155,138,224,0.72)"

                            ],


                            borderWidth:
                                2

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    animation: {

                        duration:
                            1200,

                        animateRotate:
                            true,

                        animateScale:
                            true

                    },


                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        },


                        tooltip: {

                            enabled:
                                true,


                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            context.label +
                                            ": $" +
                                            Math.round(
                                                context.raw
                                            )
                                            .toLocaleString()
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        r: {

                            beginAtZero:
                                true,


                            ticks: {

                                callback:
                                    function(value) {

                                        return (
                                            "$" +
                                            value
                                            .toLocaleString()
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   8. GRAPH 4
   RADAR CHART
   เงินเดือนเฉลี่ยตามช่วงประสบการณ์
===================================================== */

function createLineChart(data) {


    const groups = {

        "0-4": [],

        "5-9": [],

        "10-14": [],

        "15-19": [],

        "20+": []

    };



    data.forEach(d => {


        const years =
            d.years_experience;


        if (
            !Number.isFinite(years) ||
            !Number.isFinite(
                d.salary_usd
            )
        ) {

            return;

        }


        if (years < 5) {

            groups["0-4"]
                .push(
                    d.salary_usd
                );

        }

        else if (years < 10) {

            groups["5-9"]
                .push(
                    d.salary_usd
                );

        }

        else if (years < 15) {

            groups["10-14"]
                .push(
                    d.salary_usd
                );

        }

        else if (years < 20) {

            groups["15-19"]
                .push(
                    d.salary_usd
                );

        }

        else {

            groups["20+"]
                .push(
                    d.salary_usd
                );

        }

    });



    const averages =

        Object.values(
            groups
        )

        .map(salaries => {


            if (
                salaries.length === 0
            ) {

                return 0;

            }


            return (

                salaries.reduce(
                    (a, b) =>
                        a + b,
                    0
                )

                / salaries.length

            );

        });



    if (lineChart) {

        lineChart.destroy();

    }



    const ctx =
        document.getElementById(
            "lineChart"
        );



    lineChart =
        new Chart(
            ctx,
            {

                type:
                    "radar",


                data: {

                    labels:
                        Object.keys(
                            groups
                        ),


                    datasets: [

                        {

                            label:
                                "Average Salary (USD)",


                            data:
                                averages,


                            borderColor:
                                "#5c33ff",


                            backgroundColor:
                                "rgba(92,51,255,0.15)",


                            pointBackgroundColor: [

                                "#7db9d6",

                                "#9b8ae0",

                                "#f59e8b",

                                "#70c1b3",

                                "#f6c85f"

                            ],


                            pointBorderColor:
                                "#ffffff",


                            pointBorderWidth:
                                2,


                            borderWidth:
                                3,


                            pointRadius:
                                6,


                            pointHoverRadius:
                                9,


                            fill:
                                true

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    animation: {

                        duration:
                            1200,

                        easing:
                            "easeOutQuart"

                    },


                    plugins: {

                        legend: {

                            display:
                                false

                        },


                        tooltip: {

                            enabled:
                                true,


                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            "Average Salary: $" +
                                            Math.round(
                                                context.raw
                                            )
                                            .toLocaleString()
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        r: {

                            beginAtZero:
                                true,


                            angleLines: {

                                display:
                                    true

                            },


                            suggestedMin:
                                0,


                            ticks: {

                                callback:
                                    function(value) {

                                        return (
                                            "$" +
                                            value
                                            .toLocaleString()
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   9. RESET FILTER
===================================================== */

function resetFilters() {


    document.getElementById(
        "experienceFilter"
    ).value = "";


    document.getElementById(
        "educationFilter"
    ).value = "";


    document.getElementById(
        "companyFilter"
    ).value = "";


    location.reload();

}


/* =====================================================
   10. MODEL ANALYSIS
===================================================== */

const modelResults = [

    {

        model:
            "Multiple Linear Regression",

        mae:
            36948.200332,

        rmse:
            47237.034104,

        r2:
            0.266638

    },


    {

        model:
            "Random Forest Regression",

        mae:
            40953.093811,

        rmse:
            53071.708318,

        r2:
            0.074280

    }

];


/* =====================================================
   11. MODEL RESULT CARDS
===================================================== */

function showModelResults() {


    const lr =
        modelResults[0];


    const rf =
        modelResults[1];



    document.getElementById(
        "lr-mae"
    ).textContent =

        "$" +

        lr.mae.toLocaleString(
            "en-US",
            {

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }
        );



    document.getElementById(
        "lr-rmse"
    ).textContent =

        "$" +

        lr.rmse.toLocaleString(
            "en-US",
            {

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }
        );



    document.getElementById(
        "lr-r2"
    ).textContent =
        lr.r2.toFixed(4);



    document.getElementById(
        "rf-mae"
    ).textContent =

        "$" +

        rf.mae.toLocaleString(
            "en-US",
            {

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }
        );



    document.getElementById(
        "rf-rmse"
    ).textContent =

        "$" +

        rf.rmse.toLocaleString(
            "en-US",
            {

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }
        );



    document.getElementById(
        "rf-r2"
    ).textContent =
        rf.r2.toFixed(4);

}


/* =====================================================
   12. MODEL PERFORMANCE COMPARISON
===================================================== */

let modelChart;


function drawModelChart() {


    const container =
        document.getElementById(
            "model-chart"
        );


    container.innerHTML =
        '<canvas id="modelPerformanceChart"></canvas>';



    const ctx =
        document.getElementById(
            "modelPerformanceChart"
        );



    if (modelChart) {

        modelChart.destroy();

    }



    modelChart =
        new Chart(
            ctx,
            {

                type:
                    "bar",


                data: {

                    labels: [

                        "Multiple Linear Regression",

                        "Random Forest Regression"

                    ],


                    datasets: [

                        {

                            label:
                                "MAE",

                            data: [

                                modelResults[0].mae,

                                modelResults[1].mae

                            ],

                            backgroundColor:
                                "#7db9d6"

                        },


                        {

                            label:
                                "RMSE",

                            data: [

                                modelResults[0].rmse,

                                modelResults[1].rmse

                            ],

                            backgroundColor:
                                "#9b8ae0"

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    animation: {

                        duration:
                            1000,

                        easing:
                            "easeOutQuart"

                    },


                    interaction: {

                        mode:
                            "index",

                        intersect:
                            false

                    },


                    plugins: {

                        legend: {

                            display:
                                true,

                            position:
                                "top"

                        },


                        tooltip: {

                            enabled:
                                true,


                            callbacks: {

                                label:
                                    function(context) {

                                        return (

                                            context.dataset.label +

                                            ": $" +

                                            context.raw
                                                .toLocaleString(
                                                    "en-US",
                                                    {

                                                        minimumFractionDigits:
                                                            2,

                                                        maximumFractionDigits:
                                                            2

                                                    }
                                                )

                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Model"

                            }

                        },


                        y: {

                            beginAtZero:
                                true,


                            title: {

                                display:
                                    true,

                                text:
                                    "Error (USD)"

                            },


                            ticks: {

                                callback:
                                    function(value) {

                                        return (
                                            "$" +
                                            value
                                                .toLocaleString()
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   13. R² RESULT
===================================================== */

function createR2Chart() {


    const container =
        document.getElementById(
            "model-chart"
        );


    const r2Box =
        document.createElement(
            "div"
        );


    r2Box.className =
        "r2-result";


    r2Box.innerHTML = `

        <h4>R² Score</h4>

        <div class="r2-row">

            <span>
                Multiple Linear Regression
            </span>

            <strong>
                ${modelResults[0].r2.toFixed(4)}
            </strong>

        </div>
        <div class="r2-row">

            <span>
                Random Forest Regression
            </span>

            <strong>
                ${modelResults[1].r2.toFixed(4)}
            </strong>

        </div>

    `;
    container.appendChild(
        r2Box
    );

}


/* =====================================================
   14. START MODEL ANALYSIS
===================================================== */

showModelResults();

drawModelChart();

createR2Chart();
