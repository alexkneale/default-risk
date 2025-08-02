import "./styles/style.scss";

window.addEventListener("DOMContentLoaded", () => {
    const userInputData = sessionStorage.getItem("userInputs");

    if (!userInputData) {
        console.error("No user input data found");
        return;
    }

    const parsedData: Record<string, string> = JSON.parse(userInputData);

    // For now, just append the data to the .score section
    // ideas
    // fico, dti, int_rt (as these are most influential factors, according to our models)

    const scoreSection = document.querySelector(".score");
    if (scoreSection) {
        const summary = document.createElement("div");
        summary.innerHTML = `
            <h2>Your Submission</h2>
            <ul>
                ${Object.entries(parsedData)
                    .map(
                        ([key, value]) =>
                            `<li><strong>${key}:</strong> ${value}</li>`
                    )
                    .join("")}
            </ul>
        `;
        scoreSection.appendChild(summary);
    }

    const userFico = parsedData.fico;

    // Load CSV and build histogram
    fetch("/data/fico_population.csv")
        .then((res) => res.text())
        .then((csv) => {
            const parsed = Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
            });

            const ficoScores: number[] = parsed.data.map((row: any) =>
                parseInt(row.fico)
            );

            // Bin the data into frequency bins
            const bins: { [range: string]: number } = {};
            const binSize = 20;
            const minFico = 500;
            const maxFico = 850;

            for (let i = minFico; i <= maxFico; i += binSize) {
                bins[`${i}-${i + binSize - 1}`] = 0;
            }

            ficoScores.forEach((score) => {
                const binStart = Math.floor(score / binSize) * binSize;
                const binLabel = `${binStart}-${binStart + binSize - 1}`;
                if (bins[binLabel] !== undefined) {
                    bins[binLabel]++;
                }
            });

            const labels = Object.keys(bins);
            const values = Object.values(bins);

            const ficoChart = new Chart("ficoChart", {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Population FICO Distribution",
                            data: values,
                            backgroundColor: "#3498db",
                        },
                        {
                            label: "Your Score",
                            type: "line",
                            data: labels.map((label) => {
                                const [start, end] = label
                                    .split("-")
                                    .map(Number);
                                return userFico >= start && userFico <= end
                                    ? Math.max(...values)
                                    : null;
                            }),
                            borderColor: "#e74c3c",
                            borderWidth: 2,
                            pointRadius: 0,
                            fill: false,
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
                            beginAtZero: true,
                            title: { display: true, text: "Frequency" },
                        },
                        x: {
                            title: { display: true, text: "FICO Score Ranges" },
                        },
                    },
                },
            });
        });
});
