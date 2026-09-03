const API_URL = "http://127.0.0.1:5000";

let currentUser = null;
let donationHistory = [];
let selectedRequest = "";
let selectedAmount = 0;
let mapInstance = null;


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupMobileMenu();
    setupSidebar();

    await loadCurrentUser();

});


/* =========================================================
   AUTH / CURRENT USER
========================================================= */

async function loadCurrentUser() {

    try {

        const response = await fetch(
            `${API_URL}/api/auth/me`,
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            window.location.href = "login.html";
            return;
        }

        if (data.user.role !== "donor") {
            window.location.href = "login.html";
            return;
        }

        currentUser = data.user;
        window.currentUser = currentUser;

        updateUserEverywhere(currentUser);

        await loadDonationHistory();

    } catch (error) {

        console.error(error);

        window.location.href = "login.html";

    }
}


/* =========================================================
   USER UI
========================================================= */

function updateUserEverywhere(user) {

    const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const firstName =
        user.firstName || "Donor";

    document.querySelectorAll("[data-user-name]").forEach(el => {
        el.textContent = fullName;
    });

    document.querySelectorAll("[data-user-first-name]").forEach(el => {
        el.textContent = firstName;
    });

    document.querySelectorAll("[data-user-email]").forEach(el => {
        el.textContent = user.email || "—";
    });

    document.querySelectorAll("[data-user-phone]").forEach(el => {
        el.textContent = user.phone || "—";
    });

    document.querySelectorAll("[data-user-role]").forEach(el => {
        el.textContent = "Donor";
    });

    document.querySelectorAll("[data-user-status]").forEach(el => {
        el.textContent = user.isVerified
            ? "Verified"
            : "Active";
    });

    document.querySelectorAll("[data-user-created]").forEach(el => {
        el.textContent = formatDate(user.createdAt);
    });

    /*
       Replace old hard-coded dashboard name safely.
    */

    document.querySelectorAll("*").forEach(el => {

        if (
            el.children.length === 0 &&
            el.textContent &&
            (
                el.textContent.trim() === "Mayur Rathod" ||
                el.textContent.trim() === "Mayur"
            )
        ) {
            if (
                el.textContent.trim() === "Mayur Rathod"
            ) {
                el.textContent = fullName;
            } else {
                el.textContent = firstName;
            }
        }

    });

    document.title =
        `${fullName} • VeerSeva Donor Portal`;

}


/* =========================================================
   DONATION HISTORY
========================================================= */

async function loadDonationHistory() {

    try {

        const response = await fetch(
            `${API_URL}/api/donations/mine`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            donationHistory = [];
            return;
        }

        const data = await response.json();

        donationHistory =
            data.success && Array.isArray(data.donations)
                ? data.donations
                : [];

        updateDonationStats();

    } catch (error) {

        console.error(
            "Donation history error:",
            error
        );

    }

}


/* =========================================================
   REAL DONATION
========================================================= */

function openDonation(requestName, goal = 0) {

    selectedRequest = requestName;

    const modal =
        document.getElementById("donationModal");

    const requestText =
        document.getElementById("donationRequest");

    if (requestText) {
        requestText.textContent = requestName;
    }

    const custom =
        document.getElementById("customAmount");

    if (custom) {
        custom.value = "";
    }

    selectedAmount = 0;

    document
        .querySelectorAll(".amount-grid button")
        .forEach(btn => {
            btn.classList.remove("selected");
        });

    if (modal) {
        modal.classList.add("show");
    } else {
        createDonationModal();
    }

}


function closeDonation() {

    const modal =
        document.getElementById("donationModal");

    if (modal) {
        modal.classList.remove("show");
    }

}


function selectAmount(amount) {

    selectedAmount = Number(amount);

    const input =
        document.getElementById("customAmount");

    if (input) {
        input.value = selectedAmount;
    }

}


async function processDonation() {

    const input =
        Number(
            document.getElementById("customAmount")
                ?.value || 0
        );

    const amount =
        input || selectedAmount;

    if (!amount || amount < 100) {

        showToast(
            "Minimum donation amount is ₹100.",
            "error"
        );

        return;
    }

    if (!selectedRequest) {

        showToast(
            "Please select a donation request.",
            "error"
        );

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/donations`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount,
                    requestName: selectedRequest
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to create donation."
            );

        }

        closeDonation();

        await loadDonationHistory();

        showSuccessPopup(
            "Donation Created",
            `₹${amount.toLocaleString("en-IN")} donation has been recorded successfully.`,
            "Payment is pending. Connect a payment gateway to complete the transaction."
        );

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    document.querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener("click", event => {

                const text =
                    item.textContent
                        .trim()
                        .toLowerCase();

                document
                    .querySelectorAll(".nav-item")
                    .forEach(x =>
                        x.classList.remove("active")
                    );

                item.classList.add("active");

                if (text.includes("dashboard")) {
                    showDashboard();
                }

                else if (
                    text.includes("donation requests") ||
                    text.includes("requests")
                ) {
                    showDonationRequests();
                }

                else if (
                    text.includes("donation history") ||
                    text.includes("history")
                ) {
                    showHistory();
                }

                else if (
                    text.includes("my impact") ||
                    text.includes("impact")
                ) {
                    showImpact();
                }

                else if (
                    text.includes("my profile") ||
                    text.includes("profile")
                ) {
                    showProfile();
                }

                else if (
                    text.includes("settings")
                ) {
                    showSettings();
                }

                if (
                    window.innerWidth <= 800
                ) {

                    document
                        .getElementById("sidebar")
                        ?.classList.remove("open");

                }

            });

        });

}


function setupMobileMenu() {

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("sidebar");

    if (!mobileMenu || !sidebar) {
        return;
    }

    mobileMenu.addEventListener(
        "click",
        () => {
            sidebar.classList.toggle("open");
        }
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

function showDashboard() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    showToast(
        `Welcome back, ${currentUser?.firstName || "Donor"}!`,
        "success"
    );

}


/* =========================================================
   DONATION REQUESTS
========================================================= */

function showDonationRequests() {

    const requests =
        document.getElementById("requests");

    if (requests) {

        requests.scrollIntoView({
            behavior: "smooth"
        });

        return;

    }

    createRequestsPanel();

}


/* =========================================================
   HISTORY
========================================================= */

async function showHistory() {

    await loadDonationHistory();

    createHistoryPanel();

}


/* =========================================================
   IMPACT
========================================================= */

async function showImpact() {

    await loadDonationHistory();

    const total =
        donationHistory.reduce(
            (sum, item) =>
                sum + Number(item.amount || 0),
            0
        );

    const count =
        donationHistory.length;

    const completed =
        donationHistory.filter(
            item =>
                item.status === "completed"
        ).length;

    showOverlay(
        "❤️ My Impact",
        `
        <div class="vs-stat-grid">

            <div class="vs-stat">
                <span>💰</span>
                <strong>
                    ₹${total.toLocaleString("en-IN")}
                </strong>
                <small>Total Contributions</small>
            </div>

            <div class="vs-stat">
                <span>🎯</span>
                <strong>${count}</strong>
                <small>Donation Records</small>
            </div>

            <div class="vs-stat">
                <span>✅</span>
                <strong>${completed}</strong>
                <small>Completed</small>
            </div>

        </div>

        <div class="vs-impact-card">

            <div class="vs-impact-circle">
                ❤️
            </div>

            <h3>
                Your contribution creates impact
            </h3>

            <p>
                Every genuine contribution can help
                support families and welfare initiatives.
            </p>

        </div>

        <button
            class="vs-primary-btn"
            onclick="closeOverlay()">
            Done
        </button>
        `
    );

}


/* =========================================================
   PROFILE
========================================================= */

function showProfile() {

    if (!currentUser) {
        return;
    }

    const user = currentUser;

    const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim();

    showOverlay(
        "👤 My Profile",
        `

        <div class="vs-profile-head">

            <div class="vs-avatar">
                ${getInitials(fullName)}
            </div>

            <h2>${escapeHTML(fullName)}</h2>

            <span class="vs-badge">
                ✓ ${user.isVerified ? "Verified Donor" : "Active Donor"}
            </span>

        </div>

        <div class="vs-profile-grid">

            <div>
                <small>EMAIL</small>
                <strong>
                    ${escapeHTML(user.email || "—")}
                </strong>
            </div>

            <div>
                <small>MOBILE</small>
                <strong>
                    ${escapeHTML(user.phone || "—")}
                </strong>
            </div>

            <div>
                <small>ACCOUNT TYPE</small>
                <strong>Donor</strong>
            </div>

            <div>
                <small>STATUS</small>
                <strong>
                    ${user.isVerified ? "✓ Verified" : "Active"}
                </strong>
            </div>

            <div>
                <small>MEMBER SINCE</small>
                <strong>
                    ${formatDate(user.createdAt)}
                </strong>
            </div>

        </div>

        <button
            class="vs-primary-btn"
            onclick="closeOverlay()">
            Close Profile
        </button>

        `
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function showSettings() {

    showOverlay(
        "⚙️ Settings",
        `

        <div class="vs-setting">

            <div>
                <strong>Account Security</strong>
                <small>
                    Your authentication is protected by
                    a secure session.
                </small>
            </div>

            <span>🔐</span>

        </div>

        <div class="vs-setting">

            <div>
                <strong>Notifications</strong>
                <small>
                    Receive updates about donation requests.
                </small>
            </div>

            <button
                class="vs-toggle active"
                onclick="this.classList.toggle('active')">
                ●
            </button>

        </div>

        <div class="vs-setting">

            <div>
                <strong>World Support Map</strong>
                <small>
                    View support situations and donation zones.
                </small>
            </div>

            <button
                class="vs-small-btn"
                onclick="closeOverlay(); openWorldMap();">
                Open Map
            </button>

        </div>

        <button
            class="vs-primary-btn"
            onclick="closeOverlay()">
            Save & Close
        </button>

        `
    );

}


/* =========================================================
   WORLD SUPPORT MAP
========================================================= */

function openWorldMap() {

    loadLeaflet(() => {

        showOverlay(
            "🌍 World Support Situation Map",
            `

            <div class="vs-map-toolbar">

                <span>
                    🟢 Support Zone
                </span>

                <span>
                    🟡 Assistance Needed
                </span>

                <span>
                    🔵 Community Support
                </span>

            </div>

            <div
                id="veerSevaWorldMap"
                class="vs-world-map">
            </div>

            <div class="vs-map-note">
                ℹ️ This map shows humanitarian/support
                locations related to the VeerSeva project.
                It does not display military operational
                or sensitive troop-location information.
            </div>

            <button
                class="vs-primary-btn"
                onclick="closeOverlay()">
                Close Map
            </button>

            `
        );

        setTimeout(() => {

            mapInstance =
                L.map("veerSevaWorldMap")
                    .setView(
                        [20, 10],
                        2
                    );

            L.tileLayer(
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    maxZoom: 19,
                    attribution:
                        '&copy; OpenStreetMap contributors'
                }
            ).addTo(mapInstance);


            const situations = [

                {
                    name: "India",
                    lat: 20.5937,
                    lng: 78.9629,
                    type: "Support Zone",
                    text: "Community and family welfare support."
                },

                {
                    name: "South Asia",
                    lat: 23.5,
                    lng: 90.3,
                    type: "Assistance Needed",
                    text: "Humanitarian assistance monitoring zone."
                },

                {
                    name: "Middle East",
                    lat: 25.2,
                    lng: 55.3,
                    type: "Assistance Needed",
                    text: "Humanitarian support monitoring."
                },

                {
                    name: "East Africa",
                    lat: 1.3,
                    lng: 36.8,
                    type: "Community Support",
                    text: "Community welfare support zone."
                },

                {
                    name: "Europe",
                    lat: 50.1,
                    lng: 10.4,
                    type: "Community Support",
                    text: "Community assistance network."
                },

                {
                    name: "North America",
                    lat: 39.8,
                    lng: -98.5,
                    type: "Support Zone",
                    text: "Community donor network."
                }

            ];


            situations.forEach(item => {

                L.marker([
                    item.lat,
                    item.lng
                ])
                .addTo(mapInstance)
                .bindPopup(`
                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>
                    <br>
                    <b>${escapeHTML(item.type)}</b>
                    <br>
                    ${escapeHTML(item.text)}
                `);

            });

        }, 200);

    });

}


function loadLeaflet(callback) {

    if (window.L) {
        callback();
        return;
    }

    const css =
        document.createElement("link");

    css.rel = "stylesheet";

    css.href =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

    document.head.appendChild(css);

    const script =
        document.createElement("script");

    script.src =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

    script.onload = callback;

    document.head.appendChild(script);

}


/* =========================================================
   HISTORY PANEL
========================================================= */

function createHistoryPanel() {

    let rows = "";

    if (!donationHistory.length) {

        rows = `
            <div class="vs-empty">
                <div>💸</div>
                <h3>No donations yet</h3>
                <p>
                    Your real donation records will appear here.
                </p>
            </div>
        `;

    } else {

        rows =
            donationHistory
                .map(item => `
                    <div class="vs-history-row">

                        <div>
                            <strong>
                                ${escapeHTML(
                                    item.requestName || "Donation"
                                )}
                            </strong>

                            <small>
                                ${formatDate(item.createdAt)}
                            </small>
                        </div>

                        <div class="vs-history-right">

                            <strong>
                                ₹${Number(item.amount || 0)
                                    .toLocaleString("en-IN")}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item.status || "pending"
                                )}
                            </span>

                        </div>

                    </div>
                `)
                .join("");

    }

    showOverlay(
        "💰 Donation History",
        `

        <div class="vs-history-list">
            ${rows}
        </div>

        <button
            class="vs-primary-btn"
            onclick="closeOverlay()">
            Close
        </button>

        `
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function showNotifications() {

    showOverlay(
        "🔔 Notifications",
        `

        <div class="vs-notification">
            <span>🛡️</span>
            <div>
                <strong>Account Secure</strong>
                <p>
                    Your VeerSeva session is active.
                </p>
            </div>
        </div>

        <div class="vs-notification">
            <span>🌍</span>
            <div>
                <strong>World Support Map</strong>
                <p>
                    Support situation map is available.
                </p>
            </div>
        </div>

        <div class="vs-notification">
            <span>❤️</span>
            <div>
                <strong>Keep Making an Impact</strong>
                <p>
                    Your contribution history is stored
                    with your account.
                </p>
            </div>
        </div>

        <button
            class="vs-primary-btn"
            onclick="closeOverlay()">
            Done
        </button>

        `
    );

}


/* =========================================================
   SUPPORT
========================================================= */

function showSupport() {

    showOverlay(
        "💬 VeerSeva Support",
        `

        <div class="vs-support">

            <div class="vs-support-icon">
                💬
            </div>

            <h3>How can we help?</h3>

            <p>
                For account, donation or technical
                support, use the options below.
            </p>

            <button
                class="vs-support-option"
                onclick="showToast('Account support selected','success')">
                👤 Account Support
            </button>

            <button
                class="vs-support-option"
                onclick="showToast('Donation support selected','success')">
                💰 Donation Support
            </button>

            <button
                class="vs-support-option"
                onclick="showToast('Technical support selected','success')">
                🛠️ Technical Support
            </button>

        </div>

        <button
            class="vs-primary-btn"
            onclick="closeOverlay()">
            Close
        </button>

        `
    );

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    try {

        await fetch(
            `${API_URL}/api/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

    } finally {

        currentUser = null;

        window.location.href =
            "login.html";

    }

}


/* =========================================================
   OVERLAY SYSTEM
========================================================= */

function showOverlay(title, content) {

    closeOverlay();

    const overlay =
        document.createElement("div");

    overlay.id =
        "veerSevaUniversalOverlay";

    overlay.className =
        "vs-overlay";

    overlay.innerHTML = `

        <div class="vs-modal">

            <button
                class="vs-close"
                onclick="closeOverlay()">
                ×
            </button>

            <div class="vs-modal-title">
                ${title}
            </div>

            <div class="vs-modal-content">
                ${content}
            </div>

        </div>

    `;

    document.body.appendChild(overlay);

}


function closeOverlay() {

    const overlay =
        document.getElementById(
            "veerSevaUniversalOverlay"
        );

    if (overlay) {
        overlay.remove();
    }

    if (mapInstance) {

        try {
            mapInstance.remove();
        } catch (e) {}

        mapInstance = null;
    }

}


/* =========================================================
   SUCCESS POPUP
========================================================= */

function showSuccessPopup(
    title,
    message,
    extra = ""
) {

    closeOverlay();

    showOverlay(
        "✨ " + title,
        `

        <div class="vs-success">

            <div class="vs-success-check">
                ✓
            </div>

            <h2>${escapeHTML(title)}</h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <small>
                ${escapeHTML(extra)}
            </small>

        </div>

        <button
            class="vs-primary-btn"
            onclick="closeOverlay()">
            Continue
        </button>

        `
    );

}


/* =========================================================
   DONATION MODAL FALLBACK
========================================================= */

function createDonationModal() {

    const modal =
        document.createElement("div");

    modal.id =
        "donationModal";

    modal.className =
        "vs-overlay";

    modal.innerHTML = `

        <div class="vs-modal">

            <button
                class="vs-close"
                onclick="closeDonation()">
                ×
            </button>

            <div class="vs-modal-title">
                ❤️ Make a Donation
            </div>

            <p>
                Supporting:
                <strong id="donationRequest">
                    ${escapeHTML(selectedRequest)}
                </strong>
            </p>

            <div class="vs-amount-grid">

                <button onclick="selectAmount(500)">
                    ₹500
                </button>

                <button onclick="selectAmount(1000)">
                    ₹1,000
                </button>

                <button onclick="selectAmount(2500)">
                    ₹2,500
                </button>

                <button onclick="selectAmount(5000)">
                    ₹5,000
                </button>

            </div>

            <input
                id="customAmount"
                type="number"
                min="100"
                placeholder="Enter amount ₹"
            >

            <button
                class="vs-primary-btn"
                onclick="processDonation()">
                Continue Donation →
            </button>

        </div>

    `;

    document.body.appendChild(modal);

}


/* =========================================================
   STATS
========================================================= */

function updateDonationStats() {

    const total =
        donationHistory.reduce(
            (sum, item) =>
                sum + Number(item.amount || 0),
            0
        );

    document.querySelectorAll(
        "[data-total-donated]"
    ).forEach(el => {

        el.textContent =
            `₹${total.toLocaleString("en-IN")}`;

    });

    document.querySelectorAll(
        "[data-donation-count]"
    ).forEach(el => {

        el.textContent =
            donationHistory.length;

    });

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "success") {

    const old =
        document.getElementById(
            "veerSevaToast"
        );

    if (old) {
        old.remove();
    }

    const toast =
        document.createElement("div");

    toast.id =
        "veerSevaToast";

    toast.className =
        `vs-toast ${type}`;

    toast.textContent =
        message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("hide");

        setTimeout(
            () => toast.remove(),
            300
        );

    }, 3000);

}


/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {

    const parts =
        name.trim().split(/\s+/);

    return parts
        .slice(0, 2)
        .map(
            x =>
                x.charAt(0).toUpperCase()
        )
        .join("") || "VS";

}


function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   UNIVERSAL UI CSS
========================================================= */

const style =
document.createElement("style");

style.textContent = `

.vs-overlay{
    position:fixed;
    inset:0;
    z-index:99999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:18px;
    background:rgba(0,20,14,.78);
    backdrop-filter:blur(14px);
    overflow:auto;
}

.vs-modal{
    position:relative;
    width:min(650px,100%);
    max-height:92vh;
    overflow:auto;
    padding:30px;
    border-radius:28px;
    background:linear-gradient(
        145deg,
        #123f31,
        #08251d
    );
    border:1px solid rgba(242,201,76,.32);
    color:#fff;
    box-shadow:0 30px 100px rgba(0,0,0,.6);
    animation:vsModalIn .35s ease;
}

@keyframes vsModalIn{
    from{
        opacity:0;
        transform:translateY(25px) scale(.96);
    }
    to{
        opacity:1;
        transform:none;
    }
}

.vs-close{
    position:absolute;
    right:18px;
    top:15px;
    width:36px;
    height:36px;
    border:0;
    border-radius:50%;
    background:rgba(255,255,255,.08);
    color:#fff;
    font-size:24px;
    cursor:pointer;
}

.vs-modal-title{
    font-size:25px;
    font-weight:800;
    margin-bottom:24px;
    padding-right:35px;
}

.vs-primary-btn{
    width:100%;
    margin-top:20px;
    padding:14px 18px;
    border:0;
    border-radius:14px;
    background:linear-gradient(
        135deg,
        #f5d354,
        #e3b52f
    );
    color:#12352a;
    font-weight:800;
    cursor:pointer;
}

.vs-stat-grid{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:12px;
}

.vs-stat{
    padding:20px 12px;
    border-radius:18px;
    text-align:center;
    background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.07);
}

.vs-stat span{
    display:block;
    font-size:24px;
    margin-bottom:8px;
}

.vs-stat strong{
    display:block;
    color:#f5d354;
    font-size:20px;
}

.vs-stat small{
    display:block;
    margin-top:5px;
    color:rgba(255,255,255,.5);
}

.vs-profile-head{
    text-align:center;
    padding-bottom:20px;
}

.vs-avatar{
    width:80px;
    height:80px;
    margin:auto;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:linear-gradient(135deg,#f5d354,#dcae28);
    color:#12352a;
    font-size:26px;
    font-weight:900;
}

.vs-profile-head h2{
    margin:14px 0 8px;
}

.vs-badge{
    display:inline-block;
    padding:6px 12px;
    border-radius:20px;
    background:rgba(242,201,76,.12);
    color:#f5d354;
    font-size:12px;
    font-weight:700;
}

.vs-profile-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
}

.vs-profile-grid > div{
    padding:14px;
    border-radius:14px;
    background:rgba(255,255,255,.055);
}

.vs-profile-grid small{
    display:block;
    color:rgba(255,255,255,.4);
    font-size:10px;
    letter-spacing:1px;
    margin-bottom:5px;
}

.vs-profile-grid strong{
    display:block;
    word-break:break-word;
}

.vs-setting{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:15px;
    padding:16px;
    margin-bottom:10px;
    border-radius:16px;
    background:rgba(255,255,255,.055);
}

.vs-setting strong,
.vs-setting small{
    display:block;
}

.vs-setting small{
    margin-top:5px;
    color:rgba(255,255,255,.48);
}

.vs-toggle{
    width:50px;
    border:0;
    border-radius:30px;
    padding:8px;
    background:#555;
    color:#fff;
}

.vs-toggle.active{
    background:#d9ad2d;
}

.vs-small-btn{
    border:0;
    border-radius:10px;
    padding:9px 13px;
    background:#f0ca4c;
    color:#12352a;
    font-weight:700;
}

.vs-map-toolbar{
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    margin-bottom:12px;
}

.vs-map-toolbar span{
    padding:7px 10px;
    border-radius:20px;
    background:rgba(255,255,255,.07);
    font-size:11px;
}

.vs-world-map{
    width:100%;
    height:420px;
    border-radius:20px;
    overflow:hidden;
    background:#dce7e2;
}

.vs-map-note{
    margin-top:10px;
    padding:12px;
    border-radius:12px;
    background:rgba(242,201,76,.08);
    color:rgba(255,255,255,.65);
    font-size:12px;
    line-height:1.5;
}

.vs-history-list{
    display:grid;
    gap:10px;
}

.vs-history-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:15px;
    padding:15px;
    border-radius:16px;
    background:rgba(255,255,255,.055);
}

.vs-history-row small{
    display:block;
    color:rgba(255,255,255,.45);
    margin-top:4px;
}

.vs-history-right{
    text-align:right;
}

.vs-history-right strong{
    display:block;
    color:#f5d354;
}

.vs-history-right span{
    display:inline-block;
    margin-top:5px;
    padding:4px 8px;
    border-radius:10px;
    background:rgba(255,255,255,.08);
    font-size:10px;
}

.vs-empty{
    text-align:center;
    padding:35px 15px;
    color:rgba(255,255,255,.65);
}

.vs-empty div{
    font-size:45px;
}

.vs-impact-card{
    margin-top:18px;
    padding:25px;
    text-align:center;
    border-radius:22px;
    background:rgba(255,255,255,.05);
}

.vs-impact-circle{
    width:80px;
    height:80px;
    margin:auto;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:rgba(242,201,76,.13);
    font-size:30px;
}

.vs-notification{
    display:flex;
    gap:14px;
    padding:15px;
    margin-bottom:10px;
    border-radius:16px;
    background:rgba(255,255,255,.055);
}

.vs-notification > span{
    font-size:24px;
}

.vs-notification p{
    margin:4px 0 0;
    color:rgba(255,255,255,.5);
    font-size:13px;
}

.vs-support{
    text-align:center;
}

.vs-support-icon{
    font-size:45px;
}

.vs-support p{
    color:rgba(255,255,255,.58);
    line-height:1.5;
}

.vs-support-option{
    display:block;
    width:100%;
    margin:9px 0;
    padding:13px;
    border:1px solid rgba(255,255,255,.08);
    border-radius:13px;
    background:rgba(255,255,255,.05);
    color:#fff;
    text-align:left;
    cursor:pointer;
}

.vs-success{
    text-align:center;
    padding:10px 0;
}

.vs-success-check{
    width:80px;
    height:80px;
    margin:0 auto 18px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:linear-gradient(135deg,#f5d354,#dcae28);
    color:#12352a;
    font-size:42px;
    font-weight:900;
    animation:vsPulse 1.5s infinite;
}

@keyframes vsPulse{
    50%{transform:scale(1.07)}
}

.vs-success h2{
    margin:0 0 8px;
}

.vs-success p{
    color:rgba(255,255,255,.7);
}

.vs-success small{
    display:block;
    margin-top:12px;
    color:rgba(255,255,255,.45);
    line-height:1.5;
}

.vs-amount-grid{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:10px;
    margin:18px 0;
}

.vs-amount-grid button{
    padding:13px;
    border:1px solid rgba(255,255,255,.08);
    border-radius:13px;
    background:rgba(255,255,255,.05);
    color:#fff;
    font-weight:700;
}

#customAmount{
    box-sizing:border-box;
    width:100%;
    padding:14px;
    border:1px solid rgba(255,255,255,.1);
    border-radius:13px;
    background:rgba(255,255,255,.06);
    color:#fff;
}

.vs-toast{
    position:fixed;
    right:20px;
    bottom:20px;
    z-index:100000;
    max-width:330px;
    padding:14px 18px;
    border-radius:14px;
    background:#123f31;
    border:1px solid rgba(242,201,76,.3);
    color:#fff;
    box-shadow:0 15px 40px rgba(0,0,0,.4);
    animation:vsToastIn .3s ease;
}

.vs-toast.error{
    border-color:rgba(255,100,100,.4);
}

.vs-toast.hide{
    opacity:0;
    transform:translateY(10px);
    transition:.3s;
}

@keyframes vsToastIn{
    from{
        opacity:0;
        transform:translateY(15px);
    }
    to{
        opacity:1;
        transform:none;
    }
}

@media(max-width:600px){

    .vs-modal{
        padding:22px 17px;
        border-radius:22px;
    }

    .vs-stat-grid{
        grid-template-columns:1fr;
    }

    .vs-profile-grid{
        grid-template-columns:1fr;
    }

    .vs-world-map{
        height:330px;
    }

    .vs-history-row{
        align-items:flex-start;
    }

}

`;

document.head.appendChild(style);


/* =========================================================
   GLOBAL HELPERS
========================================================= */

window.openDonation = openDonation;
window.closeDonation = closeDonation;
window.selectAmount = selectAmount;
window.processDonation = processDonation;

window.showProfile = showProfile;
window.showHistory = showHistory;
window.showImpact = showImpact;
window.showSettings = showSettings;
window.showNotifications = showNotifications;
window.showSupport = showSupport;
window.showAllRequests = showDonationRequests;
window.scrollToRequests = showDonationRequests;

window.openWorldMap = openWorldMap;
window.closeOverlay = closeOverlay;
window.logout = logout;

