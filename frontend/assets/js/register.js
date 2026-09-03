const API_URL = "http://127.0.0.1:5000";

const successStyle = document.createElement("style");

successStyle.textContent = `
.veerseva-success-overlay{
    position:fixed;
    inset:0;
    z-index:99999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(1,20,14,.78);
    backdrop-filter:blur(14px);
    opacity:0;
    visibility:hidden;
    transition:.35s ease;
}

.veerseva-success-overlay.show{
    opacity:1;
    visibility:visible;
}

.veerseva-success-card{
    width:min(420px,100%);
    background:linear-gradient(145deg,#123f31,#0c2d23);
    border:1px solid rgba(242,201,76,.35);
    border-radius:28px;
    padding:38px 28px 30px;
    text-align:center;
    box-shadow:
        0 30px 90px rgba(0,0,0,.55),
        0 0 50px rgba(242,201,76,.10);
    transform:translateY(25px) scale(.94);
    transition:.45s cubic-bezier(.2,.8,.2,1);
}

.veerseva-success-overlay.show .veerseva-success-card{
    transform:translateY(0) scale(1);
}

.veerseva-check{
    width:82px;
    height:82px;
    margin:0 auto 20px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    background:linear-gradient(135deg,#f4cf52,#dcae28);
    box-shadow:0 12px 35px rgba(242,201,76,.28);
    animation:veerPulse 1.8s infinite;
}

.veerseva-check svg{
    width:42px;
    height:42px;
    fill:none;
    stroke:#10352a;
    stroke-width:3.5;
    stroke-linecap:round;
    stroke-linejoin:round;
}

.veerseva-success-card h2{
    margin:0 0 9px;
    color:#fff;
    font-size:27px;
    font-weight:800;
    letter-spacing:-.5px;
}

.veerseva-success-card .welcome{
    margin:0 0 7px;
    color:#f2cf55;
    font-size:17px;
    font-weight:700;
}

.veerseva-success-card .success-text{
    margin:0 auto 24px;
    max-width:330px;
    color:rgba(255,255,255,.72);
    font-size:14px;
    line-height:1.6;
}

.veerseva-success-btn{
    width:100%;
    border:0;
    border-radius:14px;
    padding:14px 18px;
    background:linear-gradient(135deg,#f5d354,#e7b936);
    color:#123126;
    font-size:15px;
    font-weight:800;
    cursor:pointer;
    box-shadow:0 10px 25px rgba(232,188,55,.20);
    transition:.25s ease;
}

.veerseva-success-btn:hover{
    transform:translateY(-2px);
    box-shadow:0 14px 32px rgba(232,188,55,.30);
}

.veerseva-secure{
    margin-top:18px;
    color:rgba(255,255,255,.45);
    font-size:11px;
}

@keyframes veerPulse{
    0%,100%{transform:scale(1)}
    50%{transform:scale(1.06)}
}
`;

document.head.appendChild(successStyle);


function showRegistrationSuccess(firstName) {

    const old = document.getElementById("veerSevaSuccessPopup");
    if (old) old.remove();

    const overlay = document.createElement("div");

    overlay.id = "veerSevaSuccessPopup";
    overlay.className = "veerseva-success-overlay";

    overlay.innerHTML = `
        <div class="veerseva-success-card">

            <div class="veerseva-check">
                <svg viewBox="0 0 52 52">
                    <path d="M14 27 L23 36 L39 17"></path>
                </svg>
            </div>

            <h2>Registration Successful ✨</h2>

            <p class="welcome">
                Welcome, ${escapeHTML(firstName)}! 🇮🇳
            </p>

            <p class="success-text">
                Your VeerSeva account has been created successfully.
                Your account details are securely saved.
            </p>

            <button class="veerseva-success-btn" id="continueLoginBtn">
                Continue to Login →
            </button>

            <div class="veerseva-secure">
                🔐 Secure Account • VeerSeva
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.classList.add("show");
    });

    document
        .getElementById("continueLoginBtn")
        .addEventListener("click", () => {
            window.location.href = "login.html";
        });
}


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    if (!form) {
        console.error("Registration form not found.");
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const firstName =
            document.querySelector("#firstName, [name='firstName']")?.value.trim() || "";

        const lastName =
            document.querySelector("#lastName, [name='lastName']")?.value.trim() || "";

        const email =
            document.querySelector("#email, [name='email'], input[type='email']")
            ?.value.trim().toLowerCase() || "";

        const phone =
            document.querySelector("#phone, [name='phone'], input[type='tel']")
            ?.value.trim() || "";

        const password =
            document.querySelector("#password, [name='password'], input[type='password']")
            ?.value || "";

        const confirmPassword =
            document.querySelector("#confirmPassword, [name='confirmPassword']")
            ?.value || "";

        const roleElement =
            document.querySelector("#role, [name='role']");

        let role = roleElement?.value || "";

        if (!role) {
            const checkedRole =
                document.querySelector("input[name='role']:checked");

            role = checkedRole?.value || "donor";
        }

        const terms =
            document.querySelector(
                "#terms, [name='terms'], input[type='checkbox']"
            )?.checked;

        if (!firstName || !lastName || !email || !phone || !password) {
            alert("Please fill all required fields.");
            return;
        }

        if (password.length < 8) {
            alert("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!terms) {
            alert("Please accept the Terms & Conditions.");
            return;
        }

        const button =
            form.querySelector("button[type='submit']") ||
            document.querySelector("button[type='submit']");

        const originalText =
            button?.innerText || "Create Account";

        if (button) {
            button.disabled = true;
            button.innerText = "Creating Account...";
        }

        try {

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        phone,
                        password,
                        role
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            showRegistrationSuccess(firstName);

        } catch (error) {

            console.error("Registration Error:", error);

            alert(
                "❌ Registration Failed\n\n" +
                error.message +
                "\n\nPlease make sure the VeerSeva backend is running."
            );

        } finally {

            if (button) {
                button.disabled = false;
                button.innerText = originalText;
            }
        }
    });
});
