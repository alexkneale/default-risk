import "./styles/style.scss";
import {
    Chart,
    BarElement,
    LineElement,
    PointElement,
    BarController,
    LineController,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    PieController,
    ArcElement,
} from "chart.js";
import Papa from "papaparse";

Chart.register(
    BarElement,
    LineElement,
    PointElement,
    BarController,
    LineController,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    PieController,
    ArcElement
);

const yourScoreLabelPlugin = {
    id: "yourScoreLabelPlugin",
    afterDatasetsDraw(chart: any) {
        const {
            ctx,
            scales: { x, y },
        } = chart;

        const userBarIndex = chart.config.data.datasets[0].data.findIndex(
            (_: any, idx: number) =>
                chart.config.data.datasets[0].backgroundColor[idx] === "red"
        );

        if (userBarIndex === -1) return;

        const barX = x.getPixelForTick(userBarIndex);
        const barY = y.getPixelForValue(
            chart.config.data.datasets[0].data[userBarIndex] || 0
        );

        ctx.save();
        ctx.fillStyle = "black";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("You", barX, barY - 10);
        ctx.restore();
    },
};

Chart.register(yourScoreLabelPlugin);

const form = document.getElementById("mortgage-form") as HTMLFormElement;

if (!form) throw new Error("No form");

const displayGraph = (
    targetFeature: string,
    userScore: number,
    binSize: number,
    minBin: number,
    maxBin: number,
    featureName: string
) => {
    // Load CSV and build histogram
    fetch("/data/freddiemac.csv")
        .then((res) => res.text())
        .then((csv) => {
            const parsed = Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
            });

            const featureScores: number[] = parsed.data
                .map((row: any) => parseInt(row[targetFeature]))
                .filter((score) => !isNaN(score));

            // Bin the data into frequency bins
            const bins: { [range: string]: number } = {};
            // bin size, and max and min range for fico

            // initialize lhs of all object properties
            // with name of range of bin
            for (let i = minBin; i <= maxBin; i += binSize) {
                bins[`${i}-${i + binSize - 1}`] = 0;
            }

            // for each data point, increase frequency of corresponding
            // bar in bins
            featureScores.forEach((score) => {
                // get start of bin
                const binStart = Math.floor(score / binSize) * binSize;
                // get label of bin, to use as key in bins object
                const binLabel = `${binStart}-${binStart + binSize - 1}`;
                if (bins[binLabel] !== undefined) {
                    bins[binLabel]++;
                }
            });

            const labels = Object.keys(bins);
            const values = Object.values(bins);
            const totalValue = values.reduce((acc, curr) => (acc += curr));
            const normalisedValues = values.map(
                (score) => (score / totalValue) * 100
            );
            const userIndex = labels.findIndex((label) => {
                const [start, end] = label.split("-").map(Number);
                return userScore >= start && userScore <= end;
            });

            const backgroundColors = labels.map((_, idx) =>
                idx === userIndex ? "red" : "rgba(54, 162, 235, 0.5)"
            );

            new Chart(targetFeature + "Chart", {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: featureName + " Distribution",
                            data: normalisedValues,
                            backgroundColor: backgroundColors,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true },
                        tooltip: { mode: "index", intersect: false },
                    },
                    scales: {
                        y: {
                            ticks: { callback: (value) => `${value}` },
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Percentage of Consumer Population",
                            },
                        },

                        x: {
                            title: {
                                display: true,
                                text: featureName + " Ranges",
                            },
                        },
                    },
                },
                plugins: [yourScoreLabelPlugin],
            });
        });
};

window.addEventListener("DOMContentLoaded", () => {
    // get user data filled out in form
    const userInputData = sessionStorage.getItem("userInputs");

    if (!userInputData) {
        console.error("No user input data found");
        return;
    }
    // convert json object into regular object
    const parsedData: Record<string, string> = JSON.parse(userInputData);
    Object.entries(parsedData).forEach(([key, value]) => {
        const input = form.elements.namedItem(key) as HTMLInputElement | null;
        if (input) {
            input.value = value;
        }
    });

    console.log(parsedData);
    const userFico = parseInt(parsedData["credit-score"]);
    const binSizeFico = 20;
    const minBinFico = 300;
    const maxBinFico = 850;

    displayGraph(
        "fico",
        userFico,
        binSizeFico,
        minBinFico,
        maxBinFico,
        "Credit Score"
    );

    const userDti =
        (parseInt(parsedData["debt"]) / parseInt(parsedData["income"])) * 100;
    const binSizeDti = 5;
    const minBinDti = 0;
    const maxBinDti = 99;

    displayGraph(
        "dti",
        userDti,
        binSizeDti,
        minBinDti,
        maxBinDti,
        "Debt to Income Ratio"
    );

    const userOrigUpb = parseFloat(parsedData["new-mortgage-value"]);
    const binSizeOrigUpb = 50000;
    const minBinOrigUpb = 0;
    const maxBinOrigUpb = 900000;

    displayGraph(
        "orig_upb",
        userOrigUpb,
        binSizeOrigUpb,
        minBinOrigUpb,
        maxBinOrigUpb,
        "Requested Loan Size"
    );

    new Chart("pieDefault", {
        type: "pie",
        data: {
            labels: ["Defaulting", "Not Defaulting"],
            datasets: [
                {
                    label: "How common is defaulting?",
                    data: [2.2, 97.8],
                    backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
                    hoverOffset: 4,
                },
            ],
        },
    });

    new Chart("pieAlgorithm", {
        type: "pie",
        data: {
            labels: [
                "Defaulting, and correctly flagged by algorithm",
                "Defaulting, and mistakenly not flagged by algorithm",
                "Not defaulting, and mistakenly flagged by algorithm",
                "Not defaulting, and correctly not flagged by algorithm",
            ],
            datasets: [
                {
                    label: "How common is defaulting?",
                    data: [1.5, 0.7, 25, 53],
                    backgroundColor: [
                        "rgb(255, 99, 132)",
                        "rgb(54, 162, 235)",
                        "rgb(255, 205, 86)",
                        "green",
                    ],
                    hoverOffset: 4,
                },
            ],
        },
    });

    form.style.backgroundColor = "#d1f5e0";
});

form.addEventListener("submit", (event) => {
    event.preventDefault(); // prevent form from reloading the page

    const formData = new FormData(form);
    const formValues: Record<string, string> = {};

    // Convert FormData into a plain object
    formData.forEach((value, key) => {
        formValues[key] = value.toString();
    });

    const cnt_units = parseInt(formValues["units"]);
    const prop_type = formValues["prop_type"];
    const metro = formValues["metro"];
    const cnt_borr = parseInt(formValues["people-responsible"]);
    const fico = parseFloat(formValues["credit-score"]);

    const flag_fthb = formValues["first-property"];
    const occpy_sts = formValues["property-purpose"];

    // calc dti with income and debt
    const income = parseFloat(formValues["income"]);
    const debt = parseFloat(formValues["debt"]);
    const dti = income ? (debt / income) * 100 : 0;

    // calc cltv with prop value and all mortgages
    const prop_value = parseFloat(formValues["prop_value"]);
    const orig_upb = parseFloat(formValues["new-mortgage-value"]);
    const cltv = prop_value ? (orig_upb / prop_value) * 100 : 0;

    const int_rt = parseFloat(formValues["int-rt"]);
    const orig_loan_term = parseInt(formValues["length"]);
    const mi_pct = parseInt(formValues["insurance"]);

    const body = {
        fico,
        flag_fthb,
        mi_pct,
        cnt_units,
        occpy_sts,
        cltv,
        dti,
        orig_upb,
        int_rt,
        prop_type,
        loan_purpose: formValues["mortgage-purpose"],
        orig_loan_term,
        cnt_borr,
        metro: metro === "True",
    };

    fetch("https://default-risk.onrender.com/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Prediction:", data.default_prediction);
            const formMessage = document.getElementById("form-message");
            if (data.default_prediction === 1) {
                console.log("HERE");
                // User is at risk of default → redirect to fail page
                form.style.backgroundColor = "#fbe4e4";
                formMessage!.innerText =
                    "This mortgage request has been flagged as risky ⚠️";
            } else {
                // User is not at risk → redirect to pass page
                form.style.backgroundColor = "#d1f5e0";
                formMessage!.innerText =
                    "This current mortgage request is approved ✅";
            }
        })
        .catch((error) => {
            console.error("Error calling prediction API:", error);
        });
});
