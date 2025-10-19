// --- BOOTSTRAP VALIDATION ---
(function () {
  'use strict';
  window.addEventListener('load', function () {
    let forms = document.getElementsByClassName('needs-validation');
    let validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

// First, check if the tax switch exists on the current page
let taxSwitch = document.getElementById("flexSwitchCheckDefault");
if (taxSwitch) {
  taxSwitch.addEventListener("change", () => {
    let prices = document.getElementsByClassName("price");
    for (let p of prices) {
      let base = parseFloat(p.getAttribute("data-base"));
      let total = parseFloat(p.getAttribute("data-total"));
      if (taxSwitch.checked) {
        p.innerHTML = `&#8377;${total.toLocaleString("en-IN")}/night`;
      } else {
        p.innerHTML = `&#8377;${base.toLocaleString("en-IN")}/night`;
      }
    }
  });
}

// --- BOOKING COST CALCULATION (for show page) ---
document.addEventListener('DOMContentLoaded', () => {
  const checkInInput = document.getElementById('checkIn');
  const checkOutInput = document.getElementById('checkOut');
  const bookingBtn = document.getElementById('bookingBtn');
  const form = document.querySelector('.booking-box');

  // Only run this code if we are on the show page (where these elements exist)
  if (checkInInput && checkOutInput && bookingBtn && form) {
    const pricePerNight = parseInt(form.dataset.price, 10);

    function updateBookingCost() {
      const checkInDate = new Date(checkInInput.value);
      const checkOutDate = new Date(checkOutInput.value);

      // Check if dates are valid
      if (checkInInput.value && checkOutInput.value && checkOutDate > checkInDate) {
        const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
        const totalNights = Math.ceil(timeDifference / (1000 * 3600 * 24));
        
        if (totalNights > 0) {
          const totalCost = (totalNights * pricePerNight) * (1.18);
          const formattedCost = totalCost.toLocaleString("en-IN");
          bookingBtn.textContent = `Book for ₹${formattedCost}`;
        } else {
          bookingBtn.textContent = 'Book Now';
        }
      } else {
        bookingBtn.textContent = 'Book Now';
      }
    }

    // Use 'input' for a more responsive feel
    checkInInput.addEventListener('input', updateBookingCost);
    checkOutInput.addEventListener('input', updateBookingCost);
  }
});