const DATA_PATH =
    "../../data/raw/ai_ds_job_salaries_2026.csv";


let allData = [];

let charts = {};



/* =========================
   FORMAT USD
========================= */

const usd = value =>

    new Intl.NumberFormat(
        "en-US",
        {

            style: "currency",

            currency: "USD",

            maximumFractionDigits: 0

        }

    ).format(value);



/* =========================
   LOAD CSV
========================= */

Papa.parse(
    DATA_PATH,
    {

        download: true,

        header: true,

        dynamicTyping: true,

        skipEmptyLines: true,


        complete: results => {

            allData =
                results.data.filter(
                    d =>

                        Number.isFinite(
                            d.salary_usd
                        )

                        &&

                        Number.isFinite(
                            d.years_experience
                        )
                );



            /* FILTER */

            fillSelect(
                "#experienceFilter",
                unique(
                    "experience_level"
                )
            );


            fillSelect(
                "#educationFilter",
                unique(
                    "education_level"
                )
            );


            fillSelect(
                "#companySizeFilter",
                unique(
                    "company_size"
                )
            );



            document
                .querySelectorAll(
                    "select"
                )
                .forEach(
                    select =>

                        select.addEventListener(
                            "change",
                            update
                        )
                );



            /* RESET */

            document
                .querySelector(
                    "#resetBtn"
                )
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

        },


        error: error => {

            console.error(
                error
            );

        }

    }
);



/* =========================
   UNIQUE
========================= */

function unique(field) {

    return [

        ...new Set(

            allData
                .map(
                    d =>
                        d[field]
                )

                .filter(Boolean)

        )

    ].sort();

}



/* =========================
   FILL SELECT
========================= */

function fillSelect(
    selector,
    values
) {

    const element =
        document.querySelector(
            selector
        );


    values.forEach(
        value => {

            element.insertAdjacentHTML(

                "beforeend",

                `<option value="${value}">
                    ${value}
                </option>`

            );

        }
    );

}



/* =========================
   FILTER
========================= */

function filtered() {

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



    return allData.filter(
        d =>

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

    const data =
        filtered();


    updateCards(
        data
    );


    makeBar(
        data
    );


    makeScatter(
        data
    );


    makeDoughnut(
        data
    );


    makeLine(
        data
    );

}



/* =========================
   CARDS
========================= */

function updateCards(data) {

    document
        .querySelector(
            "#count"
        )
        .textContent =
            data.length.toLocaleString();



    if (!data.length) {

        [

            "avgSalary",

            "minSalary",

            "maxSalary"

        ].forEach(
            id =>

                document
                    .querySelector(
                        "#" + id
                    )

                    .textContent =
                        "-"

        );


        return;

    }



    const salaries =
        data.map(
            d =>
                d.salary_usd
        );



    const average =

        salaries.reduce(
            (
                total,
                value
            ) =>
                total + value,

            0

        ) /

        salaries.length;



    document
        .querySelector(
            "#avgSalary"
        )

        .textContent =
            usd(
                average
            );



    document
        .querySelector(
            "#minSalary"
        )

        .textContent =
            usd(
                Math.min(
                    ...salaries
                )
            );



    document
        .querySelector(
            "#maxSalary"
        )

        .textContent =
            usd(
                Math.max(
                    ...salaries
                )
            );

}



/* =========================
   DESTROY OLD CHART
========================= */

function destroy(name) {

    if (
        charts[name]
    ) {

        charts[name].destroy();

    }

}



/* =========================
   BAR CHART
========================= */

function makeBar(data) {

    destroy("bar");


    const grouped = {};


    data.forEach(
        d => {

            if (
                !grouped[
                    d.job_title
                ]
            ) {

                grouped[
                    d.job_title
                ] = [];

            }


            grouped[
                d.job_title
            ].push(
                d.salary_usd
            );

        }
    );



    const rows =

        Object.entries(
            grouped
        )

        .map(
            ([label, values]) => ({

                label,

                value:

                    values.reduce(
                        (
                            a,
                            b
                        ) =>
                            a + b,

                        0
                    )

                    /

                    values.length

            })
        )

        .sort(
            (a, b) =>
                b.value -
                a.value
        )

        .slice(
            0,
            10
        );



    charts.bar =

        new Chart(

            document.querySelector(
                "#barChart"
            ),

            {

                type: "bar",


                data: {

                    labels:
                        rows.map(
                            r =>
                                r.label
                        ),


                    datasets: [

                        {

                            label:
                                "Average Salary",

                            data:
                                rows.map(
                                    r =>
                                        r.value
                                )

                        }

                    ]

                },


                options: {

                    responsive: true,


                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        usd(
                                            context.raw
                                        )

                            }

                        }

                    },


                    scales: {

                        y: {

                            ticks: {

                                callback:
                                    value =>
                                        "$" +
                                        Number(
                                            value
                                        ).toLocaleString()

                            }

                        }

                    }

                }

            }

        );

}



/* =========================
   SCATTER
========================= */

function makeScatter(data) {

    destroy(
        "scatter"
    );


    charts.scatter =

        new Chart(

            document.querySelector(
                "#scatterChart"
            ),

            {

                type: "scatter",


                data: {

                    datasets: [

                        {

                            label:
                                "Salary vs Experience",


                            data:

                                data
                                    .slice(
                                        0,
                                        1500
                                    )

                                    .map(
                                        d => ({

                                            x:
                                                d.years_experience,

                                            y:
                                                d.salary_usd

                                        })
                                    ),


                            pointRadius: 3

                        }

                    ]

                },


                options: {

                    responsive: true,


                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>

                                        `Experience: ${
                                            context.parsed.x
                                        } years, Salary: ${
                                            usd(
                                                context.parsed.y
                                            )
                                        }`

                            }

                        }

                    },


                    scales: {

                        x: {

                            title: {

                                display: true,

                                text:
                                    "Years Experience"

                            }

                        },


                        y: {

                            title: {

                                display: true,

                                text:
                                    "Salary (USD)"

                            }

                        }

                    }

                }

            }

        );

}



/* =========================
   DOUGHNUT
========================= */

function makeDoughnut(data) {

    destroy(
        "doughnut"
    );


    const grouped = {};


    data.forEach(
        d => {

            if (
                !grouped[
                    d.education_level
                ]
            ) {

                grouped[
                    d.education_level
                ] = [];

            }


            grouped[
                d.education_level
            ].push(
                d.salary_usd
            );

        }
    );



    const rows =

        Object.entries(
            grouped
        )

        .map(
            ([label, values]) => ({

                label,

                value:

                    values.reduce(
                        (
                            a,
                            b
                        ) =>
                            a + b,

                        0
                    )

                    /

                    values.length

            })
        );



    charts.doughnut =

        new Chart(

            document.querySelector(
                "#doughnutChart"
            ),

            {

                type:
                    "doughnut",


                data: {

                    labels:
                        rows.map(
                            r =>
                                r.label
                        ),


                    datasets: [

                        {

                            label:
                                "Average Salary",

                            data:
                                rows.map(
                                    r =>
                                        r.value
                                )

                        }

                    ]

                },


                options: {

                    responsive: true,


                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>

                                        `${
                                            context.label
                                        }: ${
                                            usd(
                                                context.raw
                                            )
                                        }`

                            }

                        }

                    }

                }

            }

        );

}



/* =========================
   LINE CHART
========================= */

function makeLine(data) {

    destroy(
        "line"
    );


    const grouped = {};


    data.forEach(
        d => {

            const bucket =

                Math.floor(
                    d.years_experience /
                    5
                ) * 5;


            if (
                !grouped[bucket]
            ) {

                grouped[bucket] = [];

            }


            grouped[bucket].push(
                d.salary_usd
            );

        }
    );



    const rows =

        Object.entries(
            grouped
        )

        .map(
            ([key, values]) => ({

                x:
                    +key,

                y:

                    values.reduce(
                        (
                            a,
                            b
                        ) =>
                            a + b,

                        0
                    )

                    /

                    values.length

            })
        )

        .sort(
            (a, b) =>
                a.x -
                b.x
        );



    charts.line =

        new Chart(

            document.querySelector(
                "#lineChart"
            ),

            {

                type: "line",


                data: {

                    datasets: [

                        {

                            label:
                                "Average Salary",

                            data:
                                rows,

                            borderWidth:
                                2.5,

                            pointRadius:
                                4,

                            tension:
                                .2

                        }

                    ]

                },


                options: {

                    responsive: true,


                    parsing: false,


                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        usd(
                                            context.parsed.y
                                        )

                            }

                        }

                    },


                    scales: {

                        x: {

                            type:
                                "linear",


                            title: {

                                display: true,

                                text:
                                    "Experience Range Start (Years)"

                            }

                        },


                        y: {

                            title: {

                                display: true,

                                text:
                                    "Salary (USD)"

                            },


                            ticks: {

                                callback:
                                    value =>
                                        "$" +
                                        Number(
                                            value
                                        ).toLocaleString()

                            }

                        }

                    }

                }

            }

        );

}