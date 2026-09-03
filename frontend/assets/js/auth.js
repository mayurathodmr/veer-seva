document.addEventListener("DOMContentLoaded", function () {

    const password = document.getElementById("password");
    const toggle = document.getElementById("passwordToggle");
    const form = document.getElementById("loginForm");
    const status = document.getElementById("statusMessage");
    const forgot = document.getElementById("forgotPassword");


    // =========================
    // PASSWORD SHOW / HIDE
    // =========================

    if (toggle && password) {

        toggle.addEventListener("click", function () {

            if (password.type === "password") {

                password.type = "text";

                toggle.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

            } else {

                password.type = "password";

                toggle.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';
            }

        });
    }


    // =========================
    // LOGIN
    // =========================

    if (form) {

        form.addEventListener("submit", async function (e) {

            e.preventDefault();


            const role =
                document.getElementById("role").value;

            const email =
                document.getElementById("email").value.trim();

            const pass =
                document.getElementById("password").value;


            status.className = "status-message";
            status.textContent = "";


            if (!role || !email || !pass) {

                status.textContent =
                    "Please complete all fields.";

                status.classList.add("show", "error");

                return;
            }


            const submitButton =
                form.querySelector('button[type="submit"]');

            const originalHTML =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';
            }


            status.textContent =
                "Authenticating your account...";

            status.classList.add("show", "success");


            try {

                const response = await fetch(
                    "http://127.0.0.1:5000/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({
                            email: email,
                            password: pass,
                            role: role
                        })
                    }
                );


                const data = await response.json();


                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message || "Invalid email or password."
                    );
                }


                status.textContent =
                    "Login successful. Redirecting...";


                const userRole =
                    data.user && data.user.role
                        ? data.user.role
                        : role;


                setTimeout(function () {

                    if (userRole === "admin") {

                        window.location.href =
                            "admin-dashboard.html";

                    } else if (userRole === "army") {

                        window.location.href =
                            "army-dashboard.html";

                    } else {

                        window.location.href =
                            "donor-dashboard.html";
                    }

                }, 500);


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                let errorMessage =
                    error.message;


                if (
                    error.name === "TypeError" ||
                    errorMessage === "Failed to fetch"
                ) {

                    errorMessage =
                        "Unable to connect to VeerSeva server. Please make sure the backend is running.";
                }


                status.className =
                    "status-message show error";

                status.textContent =
                    errorMessage;


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        originalHTML;
                }
            }

        });
    }


    // =========================
    // FORGOT PASSWORD
    // =========================

    if (forgot) {

        forgot.addEventListener("click", function (e) {

            e.preventDefault();

            const email =
                document.getElementById("email").value.trim();


            if (!email) {

                status.className =
                    "status-message show error";

                status.textContent =
                    "Enter your email address first.";

                return;
            }


            alert(
                "Password reset will be connected to secure email recovery."
            );

        });
    }

});
