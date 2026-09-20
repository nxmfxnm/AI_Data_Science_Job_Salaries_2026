const DATA_PATH =
    "../../data/raw/ai_ds_job_salaries_2026.csv";


let allData = [];

let currentData = [];


const fmtUSD =
    d3.format("$,.0f");


const fmtNumber =
    d3.format(",.0f");



/* =========================
   LOAD CSV
========================= */

d3.csv(DATA_PATH)
    .then(raw => {

        allData =
            raw
                .map(d => ({

                    ...d,

                    salary_usd:
                        +d.salary_usd,

                    years_experience:
                        +d.years_experience

                }))

                .filter(d =>

                    Number.isFinite(
                        d.salary_usd
                    )

                    &&

                    Number.isFinite(
                        d.years_experience
                    )

                );


        /* FILTER OPTIONS */

        fillSelect(
            "#experienceFilter",

            [
                ...new Set(
                    allData.map(
                        d =>
                            d.experience_level
                    )
                )
            ].sort()
        );


        fillSelect(
            "#educationFilter",

            [
                ...new Set(
                    allData.map(
                        d =>
                            d.education_level
                    )
                )
            ].sort()
        );


        fillSelect(
            "#companySizeFilter",

            [
                ...new Set(
                    allData.map(
                        d =>
                            d.company_size
                    )
                )
            ].sort()
        );


        /* FILTER EVENT */

        [
            "#experienceFilter",
            "#educationFilter",
            "#companySizeFilter"

        ].forEach(selector => {

            document
                .querySelector(selector)
                .addEventListener(
                    "change",
                    update
                );

        });


        /* RESET */

        document
            .querySelector("#resetBtn")
            .addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            "select"
                        )
                        .forEach(
                            select =>
                                select.value =
                                    "All"
                        );


                    update();

                }
            );


        update();

    })


    .catch(error => {

        console.error(error);

        document
            .querySelector(".container")
            .innerHTML += `

                <p class="empty">

                    ไม่สามารถโหลด CSV ได้

                </p>

            `;

    });



/* =========================
   SELECT
========================= */

function fillSelect(
    selector,
    values
) {

    const element =
        document.querySelector(
            selector
        );


    values.forEach(value => {

        element.insertAdjacentHTML(

            "beforeend",

            `<option value="${value}">
                ${value}
            </option>`

        );

    });

}



/* =========================
   FILTER DATA
========================= */

function filteredData() {

    const experience =
        document.querySelector(
            "#experienceFilter"
        ).value;


    const education =
        document.querySelector(
            "#educationFilter"
        ).value;


    const companySize =
        document.querySelector(
            "#companySizeFilter"
        ).value;


    return allData.filter(d =>

        (
            experience === "All"

            ||

            d.experience_level ===
                experience
        )

        &&

        (
            education === "All"

            ||

            d.education_level ===
                education
        )

        &&

        (
            companySize === "All"

            ||

            d.company_size ===
                companySize
        )

    );

}



/* =========================
   UPDATE
========================= */

function update() {

    currentData =
        filteredData();


    updateCards(
        currentData
    );


    drawBar(
        currentData
    );


    drawScatter(
        currentData
    );


    drawDonut(
        currentData
    );


    drawLine(
        currentData
    );

}



/* =========================
   SUMMARY CARDS
========================= */

function updateCards(data) {

    d3.select("#count")
        .text(
            fmtNumber(
                data.length
            )
        );


    if (!data.length) {

        [
            "#avgSalary",
            "#minSalary",
            "#maxSalary"

        ].forEach(selector =>

            d3.select(selector)
                .text("-")

        );

        return;

    }


    const salaries =
        data.map(
            d =>
                d.salary_usd
        );


    d3.select("#avgSalary")
        .text(
            fmtUSD(
                d3.mean(
                    salaries
                )
            )
        );


    d3.select("#minSalary")
        .text(
            fmtUSD(
                d3.min(
                    salaries
                )
            )
        );


    d3.select("#maxSalary")
        .text(
            fmtUSD(
                d3.max(
                    salaries
                )
            )
        );

}



/* =========================
   SVG
========================= */

function makeSvg(
    selector,
    width = 680,
    height = 390
) {

    d3.select(selector)
        .html("");


    return d3
        .select(selector)
        .append("svg")

        .attr(
            "viewBox",
            `0 0 ${width} ${height}`
        )

        .attr(
            "preserveAspectRatio",
            "xMidYMid meet"
        );

}



/* =========================
   TOOLTIP
========================= */

function tooltip() {

    let t =
        d3.select("body")
            .select(".tooltip");


    if (t.empty()) {

        t =
            d3.select("body")
                .append("div")
                .attr(
                    "class",
                    "tooltip"
                )
                .style(
                    "display",
                    "none"
                );

    }


    return t;

}



/* =========================
   BAR CHART
========================= */

function drawBar(data) {

    const svg =
        makeSvg(
            "#barChart"
        );


    const margin = {

        top: 20,

        right: 20,

        bottom: 105,

        left: 75

    };


    const width = 680;

    const height = 390;


    const g =
        svg.append("g")
            .attr(
                "transform",

                `translate(
                    ${margin.left},
                    ${margin.top}
                )`
            );


    const innerWidth =
        width -
        margin.left -
        margin.right;


    const innerHeight =
        height -
        margin.top -
        margin.bottom;



    const grouped =

        d3.rollups(

            data,

            values =>
                d3.mean(
                    values,
                    d =>
                        d.salary_usd
                ),

            d =>
                d.job_title

        )

        .sort(
            (a, b) =>
                d3.descending(
                    a[1],
                    b[1]
                )
        )

        .slice(
            0,
            10
        );



    if (!grouped.length) {

        svg.append("text")

            .attr(
                "x",
                width / 2
            )

            .attr(
                "y",
                height / 2
            )

            .attr(
                "text-anchor",
                "middle"
            )

            .text(
                "ไม่มีข้อมูล"
            );

        return;

    }



    const x =
        d3.scaleBand()

            .domain(
                grouped.map(
                    d => d[0]
                )
            )

            .range([
                0,
                innerWidth
            ])

            .padding(.18);



    const y =
        d3.scaleLinear()

            .domain([
                0,

                d3.max(
                    grouped,
                    d => d[1]
                ) * 1.1

            ])

            .nice()

            .range([
                innerHeight,
                0
            ]);



    g.append("g")

        .attr(
            "class",
            "axis"
        )

        .call(
            d3.axisLeft(y)
                .ticks(6)
                .tickFormat(
                    d =>
                        "$" +
                        d3.format(
                            ".2s"
                        )(d)
                )
        );



    g.append("g")

        .attr(
            "class",
            "axis"
        )

        .attr(
            "transform",

            `translate(
                0,
                ${innerHeight}
            )`
        )

        .call(

            d3.axisBottom(x)

                .tickFormat(
                    d =>
                        d.length > 13
                            ? d.slice(
                                0,
                                13
                              ) + "…"
                            : d
                )

        )

        .selectAll("text")

        .attr(
            "transform",
            "rotate(-38)"
        )

        .style(
            "text-anchor",
            "end"
        );



    const t =
        tooltip();



    g.selectAll(".bar")

        .data(grouped)

        .join("rect")

        .attr(
            "class",
            "bar"
        )

        .attr(
            "x",
            d =>
                x(d[0])
        )

        .attr(
            "y",
            d =>
                y(d[1])
        )

        .attr(
            "width",
            x.bandwidth()
        )

        .attr(
            "height",
            d =>
                innerHeight -
                y(d[1])
        )

        .on(
            "mousemove",
            (event, d) => {

                t

                    .style(
                        "display",
                        "block"
                    )

                    .style(
                        "left",
                        (
                            event.clientX +
                            12
                        ) + "px"
                    )

                    .style(
                        "top",
                        (
                            event.clientY +
                            12
                        ) + "px"
                    )

                    .html(`

                        <b>
                            ${d[0]}
                        </b>

                        <br>

                        Average:
                        ${fmtUSD(d[1])}

                    `);

            }
        )

        .on(
            "mouseout",
            () =>
                t.style(
                    "display",
                    "none"
                )
        );

}



/* =========================
   SCATTER PLOT
========================= */

function drawScatter(data) {

    const svg =
        makeSvg(
            "#scatterChart"
        );


    const margin = {

        top: 20,

        right: 20,

        bottom: 55,

        left: 70

    };


    const width = 680;

    const height = 390;


    const g =
        svg.append("g")

            .attr(
                "transform",

                `translate(
                    ${margin.left},
                    ${margin.top}
                )`
            );


    const innerWidth =
        width -
        margin.left -
        margin.right;


    const innerHeight =
        height -
        margin.top -
        margin.bottom;



    const x =
        d3.scaleLinear()

            .domain([
                0,

                d3.max(
                    data,
                    d =>
                        d.years_experience
                ) || 1

            ])

            .nice()

            .range([
                0,
                innerWidth
            ]);




    const y =
        d3.scaleLinear()

            .domain([
                0,

                d3.max(
                    data,
                    d =>
                        d.salary_usd
                ) || 1

            ])

            .nice()

            .range([
                innerHeight,
                0
            ]);



    g.append("g")

        .attr(
            "class",
            "axis"
        )

        .attr(
            "transform",

            `translate(
                0,
                ${innerHeight}
            )`
        )

        .call(
            d3.axisBottom(x)
        );



    g.append("g")

        .attr(
            "class",
            "axis"
        )

        .call(

            d3.axisLeft(y)

                .ticks(6)

                .tickFormat(
                    d =>
                        "$" +
                        d3.format(
                            ".2s"
                        )(d)
                )

        );



    const t =
        tooltip();



    g.selectAll(".dot")

        .data(
            data.slice(
                0,
                1500
            )
        )

        .join("circle")

        .attr(
            "class",
            "dot"
        )

        .attr(
            "cx",
            d =>
                x(
                    d.years_experience
                )
        )

        .attr(
            "cy",
            d =>
                y(
                    d.salary_usd
                )
        )

        .attr(
            "r",
            3.2
        )

        .on(
            "mousemove",
            (event, d) => {

                t

                    .style(
                        "display",
                        "block"
                    )

                    .style(
                        "left",
                        (
                            event.clientX +
                            12
                        ) + "px"
                    )

                    .style(
                        "top",
                        (
                            event.clientY +
                            12
                        ) + "px"
                    )

                    .html(`

                        <b>
                            ${d.job_title}
                        </b>

                        <br>

                        Experience:
                        ${d.years_experience}
                        years

                        <br>

                        Salary:
                        ${fmtUSD(
                            d.salary_usd
                        )}

                    `);

            }
        )

        .on(
            "mouseout",
            () =>
                t.style(
                    "display",
                    "none"
                )
        );

}



/* =========================
   DONUT CHART
========================= */

function drawDonut(data) {

    const svg =
        makeSvg(
            "#donutChart"
        );


    const width = 680;

    const height = 390;


    const centerX = 250;

    const centerY = 195;

    const radius = 125;



    const grouped =

        d3.rollups(

            data,

            values =>
                d3.mean(
                    values,
                    d =>
                        d.salary_usd
                ),

            d =>
                d.education_level

        );



    if (!grouped.length) {

        return;

    }



    const pie =
        d3.pie()
            .value(
                d => d[1]
            );



    const arc =
        d3.arc()

            .innerRadius(70)

            .outerRadius(
                radius
            );



    const color =
        d3.scaleOrdinal()

            .domain(
                grouped.map(
                    d => d[0]
                )
            )

            .range(
                d3.schemeTableau10
            );



    const g =
        svg.append("g")

            .attr(
                "transform",

                `translate(
                    ${centerX},
                    ${centerY}
                )`
            );



    const t =
        tooltip();



    g.selectAll("path")

        .data(
            pie(grouped)
        )

        .join("path")

        .attr(
            "d",
            arc
        )

        .attr(
            "fill",
            d =>
                color(
                    d.data[0]
                )
        )

        .on(
            "mousemove",
            (event, d) => {

                t

                    .style(
                        "display",
                        "block"
                    )

                    .style(
                        "left",
                        (
                            event.clientX +
                            12
                        ) + "px"
                    )

                    .style(
                        "top",
                        (
                            event.clientY +
                            12
                        ) + "px"
                    )

                    .html(`

                        <b>
                            ${d.data[0]}
                        </b>

                        <br>

                        Average:
                        ${fmtUSD(
                            d.data[1]
                        )}

                    `);

            }
        )

        .on(
            "mouseout",
            () =>
                t.style(
                    "display",
                    "none"
                )
        );



    const legend =
        svg.append("g")

            .attr(
                "transform",
                "translate(410,80)"
            );



    grouped.forEach(
        (d, i) => {

            const row =
                legend.append("g")

                    .attr(
                        "transform",
                        `translate(
                            0,
                            ${i * 28}
                        )`
                    );


            row.append("rect")

                .attr(
                    "width",
                    14
                )

                .attr(
                    "height",
                    14
                )

                .attr(
                    "fill",
                    color(d[0])
                );


            row.append("text")

                .attr(
                    "x",
                    22
                )

                .attr(
                    "y",
                    12
                )

                .text(
                    `${d[0]}: ${fmtUSD(d[1])}`
                );

        }
    );

}



/* =========================
   LINE CHART
========================= */

function drawLine(data) {

    const svg =
        makeSvg(
            "#lineChart"
        );


    const margin = {

        top: 20,

        right: 20,

        bottom: 55,

        left: 70

    };


    const width = 680;

    const height = 390;


    const g =
        svg.append("g")

            .attr(
                "transform",

                `translate(
                    ${margin.left},
                    ${margin.top}
                )`
            );


    const innerWidth =
        width -
        margin.left -
        margin.right;


    const innerHeight =
        height -
        margin.top -
        margin.bottom;



    const bucket =

        d3.rollups(

            data,

            values =>
                d3.mean(
                    values,
                    d =>
                        d.salary_usd
                ),

            d =>
                Math.floor(
                    d.years_experience / 5
                ) * 5

        )

        .sort(
            (a, b) =>
                a[0] - b[0]
        )

        .map(
            d => ({

                x: d[0],

                y: d[1]

            })
        );



    if (!bucket.length) {

        return;

    }



    const x =
        d3.scaleLinear()

            .domain(
                d3.extent(
                    bucket,
                    d => d.x
                )
            )

            .nice()

            .range([
                0,
                innerWidth
            ]);




    const y =
        d3.scaleLinear()

            .domain([
                0,

                d3.max(
                    bucket,
                    d => d.y
                ) * 1.1

            ])

            .nice()

            .range([
                innerHeight,
                0
            ]);



    g.append("g")

        .attr(
            "class",
            "axis"
        )

        .attr(
            "transform",

            `translate(
                0,
                ${innerHeight}
            )`
        )

        .call(

            d3.axisBottom(x)

                .ticks(6)

                .tickFormat(
                    d =>
                        d +
                        " yrs"
                )

        );



    g.append("g")

        .attr(
            "class",
            "axis"
        )

        .call(

            d3.axisLeft(y)

                .ticks(6)

                .tickFormat(
                    d =>
                        "$" +
                        d3.format(
                            ".2s"
                        )(d)
                )

        );



    const line =
        d3.line()

            .x(
                d =>
                    x(d.x)
            )

            .y(
                d =>
                    y(d.y)
            );



    g.append("path")

        .datum(bucket)

        .attr(
            "fill",
            "none"
        )

        .attr(
            "stroke",
            "currentColor"
        )

        .attr(
            "stroke-width",
            2.5
        )

        .attr(
            "d",
            line
        );



    const t =
        tooltip();



    g.selectAll(".point")

        .data(bucket)

        .join("circle")

        .attr(
            "cx",
            d =>
                x(d.x)
        )

        .attr(
            "cy",
            d =>
                y(d.y)
        )

        .attr(
            "r",
            5
        )

        .on(
            "mousemove",
            (event, d) => {

                t

                    .style(
                        "display",
                        "block"
                    )

                    .style(
                        "left",
                        (
                            event.clientX +
                            12
                        ) + "px"
                    )

                    .style(
                        "top",
                        (
                            event.clientY +
                            12
                        ) + "px"
                    )

                    .html(`

                        <b>
                            ${d.x}–${d.x + 4.9}
                            years
                        </b>

                        <br>

                        Average:
                        ${fmtUSD(d.y)}

                    `);

            }
        )

        .on(
            "mouseout",
            () =>
                t.style(
                    "display",
                    "none"
                )
        );

}