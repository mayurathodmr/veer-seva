const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const modal = document.getElementById("requestModal");


// MOBILE MENU
if (menuBtn) {

  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

}


// NAVIGATION
document.querySelectorAll(".nav-link").forEach(link => {

  link.addEventListener("click", () => {

    document.querySelectorAll(".nav-link")
      .forEach(item => item.classList.remove("active"));

    link.classList.add("active");

    if (window.innerWidth <= 800) {
      sidebar.classList.remove("open");
    }

  });

});


// OPEN REQUEST MODAL
function openRequestModal() {

  modal.classList.add("show");

}


// CLOSE REQUEST MODAL
function closeRequestModal() {

  modal.classList.remove("show");

}


// REQUEST FORM
document.getElementById("requestForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const category =
      document.getElementById("category").value;

    const title =
      document.getElementById("requestTitle").value.trim();

    const amount =
      Number(document.getElementById("requiredAmount").value);

    const description =
      document.getElementById("description").value.trim();


    if (!category || !title || !amount || !description) {

      alert("Please complete all fields.");

      return;
    }


    if (amount < 100) {

      alert("Required amount should be at least ₹100.");

      return;
    }


    closeRequestModal();


    setTimeout(() => {

      alert(
        "Request Demo Submitted\n\n" +
        "Category: " + category +
        "\nTitle: " + title +
        "\nRequired Amount: ₹" +
        amount.toLocaleString("en-IN") +
        "\n\nRequest ID: VS-DEMO-" +
        Math.floor(1000 + Math.random() * 9000) +
        "\n\nFrontend demo only. Nothing was actually submitted."
      );


      document
        .getElementById("requestForm")
        .reset();

    }, 200);

});


// VIEW REQUEST
function viewRequest(id) {

  alert(
    "Request Details\n\n" +
    "Request ID: " + id +
    "\n\nStatus: Active\n" +
    "Verification: Verified\n" +
    "Payment Processing: Demo only"
  );

}


// NOTIFICATIONS
function showNotifications() {

  alert(
    "Notifications\n\n" +
    "✓ Your profile has been verified.\n" +
    "✓ Your medical request received new support.\n" +
    "✓ Request VS-REQ-0972 reached 92% funding."
  );

}


// PROFILE
function showProfile() {

  alert(
    "Profile\n\n" +
    "Name: Arjun Rathod\n" +
    "Role: Army Personnel\n" +
    "Status: Verified\n\n" +
    "Profile editing is frontend-demo only."
  );

}


// SCROLL
function scrollToRequests() {

  document
    .getElementById("requests")
    .scrollIntoView({
      behavior: "smooth"
    });

}


// CLOSE MODAL ON BACKDROP
modal.addEventListener("click", function(event) {

  if (event.target === modal) {
    closeRequestModal();
  }

});


// ESCAPE
document.addEventListener("keydown", function(event) {

  if (event.key === "Escape") {
    closeRequestModal();
  }

});
