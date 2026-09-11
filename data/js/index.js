const menuToggle = document.querySelector(".menu-toggle");
const navRight = document.querySelector(".nav-right");

menuToggle.addEventListener("click", () => {
  console.log("Clicked");
  navRight.classList.toggle("active");
});

const navLinks = document.querySelectorAll(".nav-menu a");

navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    if (this.nextElementSibling) {
      // This link has a submenu (Services)
      return;
    }

    navRight.classList.remove("active");
  });
});

const dropdown = document.querySelector(".dropdown > a");

dropdown.addEventListener("click", function (e) {
  if (window.innerWidth <= 992) {
    e.preventDefault();

    this.parentElement.classList.toggle("active");
  }
});

// contact us form js

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(contactForm);

    const data = {
      name: formData.get("fullname"),
      email: formData.get("email"),
      company: formData.get("company"),
      phone: formData.get("phone"),
      service: formData.get("service"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Message sent successfully!");
        contactForm.reset();
      } else {
        alert(result.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Unable to send message. Please try again.");
    }
  });
}
