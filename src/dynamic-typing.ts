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
    const h2 = document.getElementById("animation");

    if (!h2) return;

    function startSequence() {
        typeWriterSequence(h2, "Hi, I'm Alex 👋", 100, 1500, 50, startSequence);
    }

    startSequence();
});
