(function () {
    window.addEventListener("popstate", function () {
        for (let i = 0; i < 10; i++) {
            window.history.pushState("target", "", location.href);
        }
    });
    window.history.pushState("target", "", location.href);
})();

let EBtEl = document.getElementById("expand-button");
let text = document.getElementById("text");
let shadow = document.querySelector(".app-description__content .shadow");
let matchTheme = null;
const showText = EBtEl?.getAttribute("data-show") || "Show more";
const hideText = EBtEl?.getAttribute("data-hide") || "Hide";
const locale = document.documentElement.getAttribute("lang");

if (EBtEl) {
    EBtEl.innerText = showText;
    EBtEl.addEventListener("click", () => {
        if (EBtEl.innerText === showText) {
            EBtEl.innerText = hideText;
            text?.classList.remove("collapsed");
            if (shadow) shadow.style.display = "none";
        } else {
            EBtEl.innerText = showText;
            text?.classList.add("collapsed");
            if (shadow) shadow.style.display = "block";
        }
    });
}

const helpers = {
    decode: (value) => {
        const decode = document.createElement("textarea");
        decode.innerHTML = value;
        return decode.innerText;
    },
};

window.addEventListener("load", function () {
    document.querySelectorAll("[helpers-decode]").forEach((value) => {
        value.innerText = helpers.decode(value.innerText);
    });
});

function convertNumbersToBengali(inputString) {
    const arabicToBengaliMap = {
        0: "เงฆ",
        1: "เงง",
        2: "เงจ",
        3: "เงฉ",
        4: "เงช",
        5: "เงซ",
        6: "เงฌ",
        7: "เงญ",
        8: "เงฎ",
        9: "เงฏ",
    };
    return inputString.replace(/[0-9]/g, (match) => arabicToBengaliMap[+match]);
}

const setTheme = () => {
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        document.body.classList.add("theme-dark");
    } else {
        document.body.classList.add("theme-light");
    }

    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (event) => {
            if (event.matches) {
                document.body.classList.remove("theme-light");
                document.body.classList.add("theme-dark");
            } else {
                document.body.classList.remove("theme-dark");
                document.body.classList.add("theme-light");
            }
        });
};

if (locale === "bn") {
    const elementsWithNumbers = document.querySelectorAll("[data-number]");
    elementsWithNumbers.forEach((elem) => {
        elem.innerHTML = convertNumbersToBengali(elem.getAttribute("data-number"));
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    matchTheme = JSON.parse(document.body.getAttribute("data-match-theme") || "false");
    if (matchTheme) {
        setTheme();
    }
});  