import "./styles/style.scss";

// A function to animate typing and deleting of a single text string
function typeWriterSequence(
    element: HTMLElement,
    text: string,
    typingSpeed: number,
    pause: number,
    deletingSpeed: number,
    onComplete?: () => void
): void {
    let i = 0;
    let isDeleting = false;

    function type() {
        if (!isDeleting) {
            element.textContent = text.substring(0, i + 1);
            i++;

            if (i === text.length) {
                isDeleting = true;
                setTimeout(type, pause);
                return;
            }
        } else {
            element.textContent = text.substring(0, i - 1);
            i--;

            if (i === 0) {
                isDeleting = false;
                if (typeof onComplete === "function") {
                    setTimeout(onComplete, 700);
                    return;
                }
            }
        }

        setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    }

    type();
}

window.addEventListener("DOMContentLoaded", () => {
    const h2 = document.getElementById("animation")!;

    function startSequence() {
        typeWriterSequence(
            h2,
            "Banking Algorithms, Uncovered.",
            100,
            1500,
            50,
            startSequence
        );
    }

    startSequence();

    const form = document.getElementById("mortgage-form") as HTMLFormElement;

    document.getElementById("show-form-btn")!.addEventListener("click", () => {
        const formContainer = document.getElementById("form-container")!;
        formContainer.style.display = "block";

        const formButton = document.getElementById("start-form")!;
        formButton.style.display = "none";
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault(); // prevent form from reloading the page

        const formData = new FormData(form);
        const formValues: Record<string, string> = {};

        // Convert FormData into a plain object
        formData.forEach((value, key) => {
            formValues[key] = value.toString();
        });

        // Now you can manipulate the data however you like
        console.log("Form values:", formValues);

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

        if (dti > 100) {
            alert(
                "Your monthly debt cannot be greater than your monthly income."
            );
            return;
        }

        // calc cltv with prop value and all mortgages
        const prop_value = parseFloat(formValues["prop_value"]);
        const orig_upb = parseFloat(formValues["new-mortgage-value"]);
        const cltv = prop_value ? (orig_upb / prop_value) * 100 : 0;
        if (cltv > 100) {
            alert("Requested loan size cannot exceed the property value.");
            return;
        }

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
                sessionStorage.setItem(
                    "userInputs",
                    JSON.stringify(formValues)
                );

                console.log("Prediction:", data.default_prediction);
                if (data.default_prediction === 1) {
                    // User is at risk of default → redirect to fail page
                    window.location.href = "fail.html";
                } else {
                    // User is not at risk → redirect to pass page
                    window.location.href = "pass.html";
                }
            })
            .catch((error) => {
                console.error("Error calling prediction API:", error);
            });
    });
});
