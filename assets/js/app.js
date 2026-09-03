document.addEventListener("DOMContentLoaded", () => {

    /* ================= COUNTER ANIMATION ================= */

    const counters = document.querySelectorAll("[data-counter]");

    const counterObserver = new IntersectionObserver((entries, observer) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const counter = entry.target;
            const target = Number(counter.dataset.counter);
            let current = 0;

            const increment = Math.max(1, Math.ceil(target / 80));

            const updateCounter = () => {

                current += increment;

                if (current >= target) {
                    counter.textContent = target.toLocaleString("en-IN") + "+";
                    return;
                }

                counter.textContent = current.toLocaleString("en-IN");
                requestAnimationFrame(updateCounter);
            };

            updateCounter();
            observer.unobserve(counter);
        });

    }, {
        threshold: 0.5
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });


    /* ================= NAVBAR EFFECT ================= */

    const navbar = document.querySelector(".navbar");

    function updateNavbar() {

        if (window.scrollY > 50) {
            navbar.style.background = "rgba(3, 10, 7, 0.94)";
            navbar.style.padding = "11px 0";
        } else {
            navbar.style.background = "rgba(5, 14, 10, 0.72)";
            navbar.style.padding = "18px 0";
        }

    }

    window.addEventListener("scroll", updateNavbar);
    updateNavbar();


    /* ================= ACTIVE NAV LINK ================= */

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function updateActiveLink() {

        let current = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight
            ) {
                current = section.getAttribute("id");
            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }

        });

    }

    window.addEventListener("scroll", updateActiveLink);


    /* ================= SMOOTH SCROLL ================= */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            const navbarCollapse =
                document.querySelector(".navbar-collapse");

            if (
                navbarCollapse &&
                navbarCollapse.classList.contains("show")
            ) {

                const bsCollapse =
                    bootstrap.Collapse.getInstance(navbarCollapse);

                if (bsCollapse) {
                    bsCollapse.hide();
                }

            }

        });

    });


    /* ================= DONATION DEMO ================= */

    const donateButtons = document.querySelectorAll(".donate-btn");

    donateButtons.forEach(button => {

        button.addEventListener("click", () => {

            const card = button.closest(".request-card");

            const title =
                card?.querySelector("h4")?.textContent ||
                "Donation Request";

            showDonationMessage(title);

        });

    });


    function showDonationMessage(title) {

        const oldModal = document.getElementById("donationDemoModal");

        if (oldModal) {
            oldModal.remove();
        }

        const modal = document.createElement("div");

        modal.id = "donationDemoModal";

        modal.innerHTML = `
            <div class="demo-modal-backdrop">

                <div class="demo-modal">

                    <button class="demo-close" aria-label="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                    <div class="demo-modal-icon">
                        <i class="fa-solid fa-hand-holding-heart"></i>
                    </div>

                    <span class="demo-label">
                        DONATION
                    </span>

                    <h3>${escapeHtml(title)}</h3>

                    <p>
                        This is a frontend demo.
                        Payment processing will be connected later.
                    </p>

                    <div class="demo-amounts">

                        <button data-amount="500">₹500</button>
                        <button data-amount="1000">₹1,000</button>
                        <button data-amount="2500">₹2,500</button>
                        <button data-amount="5000">₹5,000</button>

                    </div>

                    <button class="demo-confirm">
                        Continue
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>

                    <small>
                        Demo mode • No real payment is processed
                    </small>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        requestAnimationFrame(() => {
            modal.classList.add("show");
        });


        const close = () => {

            modal.classList.remove("show");

            setTimeout(() => {
                modal.remove();
            }, 250);

        };


        modal.querySelector(".demo-close")
            .addEventListener("click", close);


        modal.querySelector(".demo-modal-backdrop")
            .addEventListener("click", event => {

                if (event.target.classList.contains("demo-modal-backdrop")) {
                    close();
                }

            });


        let selectedAmount = 1000;

        const amountButtons =
            modal.querySelectorAll(".demo-amounts button");

        amountButtons.forEach(amountButton => {

            amountButton.addEventListener("click", () => {

                amountButtons.forEach(btn => {
                    btn.classList.remove("selected");
                });

                amountButton.classList.add("selected");

                selectedAmount =
                    Number(amountButton.dataset.amount);

            });

        });


        amountButtons[1].classList.add("selected");


        modal.querySelector(".demo-confirm")
            .addEventListener("click", () => {

                modal.querySelector(".demo-modal").innerHTML = `
                    <div class="demo-success">

                        <div class="success-icon">
                            <i class="fa-solid fa-check"></i>
                        </div>

                        <h3>Thank You ❤️</h3>

                        <p>
                            Demo donation of
                            <strong>₹${selectedAmount.toLocaleString("en-IN")}</strong>
                            selected successfully.
                        </p>

                        <small>
                            No real payment has been processed.
                        </small>

                        <button class="demo-confirm close-success">
                            Done
                        </button>

                    </div>
                `;

                modal.querySelector(".close-success")
                    .addEventListener("click", close);

            });

    }


    /* ================= SAFE HTML ================= */

    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* ================= SCROLL REVEAL ================= */

    const revealElements = document.querySelectorAll(
        ".feature-card, .request-card, .step-card, .stat-card"
    );

    revealElements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(25px)";
        element.style.transition =
            "opacity .7s ease, transform .7s ease";
    });


    const revealObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";

                revealObserver.unobserve(entry.target);

            });

        },
        {
            threshold: 0.12
        }
    );


    revealElements.forEach(element => {
        revealObserver.observe(element);
    });


    /* ================= ESC KEY ================= */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            const modal =
                document.getElementById("donationDemoModal");

            if (modal) {
                modal.remove();
            }

        }

    });

});
