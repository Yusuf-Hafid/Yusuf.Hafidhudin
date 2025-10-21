// JavaScript untuk animasi dan interaktivitas

// Fungsi untuk download CV (demo)
function downloadCV() {
  // Menampilkan alert karena ini hanya demo
  alert("Fitur download CV akan tersedia setelah CV disiapkan!");

  // Dalam implementasi nyata, bisa menggunakan:
  // window.open('path/to/cv.pdf', '_blank');
}

// Animasi untuk skill tags saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Mengambil semua elemen skill tag
  const skillTags = document.querySelectorAll(".skill-tag");

  // Memberikan delay animasi untuk setiap skill tag
  skillTags.forEach((tag, index) => {
    tag.style.animationDelay = `${index * 0.1}s`;
    tag.style.animation = "fadeInUp 0.6s ease-out forwards";
  });
});

// Smooth scroll effect untuk navigasi (jika ada)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Efek parallax sederhana pada scroll
window.addEventListener("scroll", function () {
  const scrolled = window.pageYOffset;
  const header = document.querySelector(".header");

  // Memberikan efek parallax pada header
  if (header) {
    header.style.transform = `translateY(${scrolled * 0.1}px)`;
  }
});

// Fungsi untuk menambah interaktivitas pada card
const cards = document.querySelectorAll(".card");
cards.forEach((card) => {
  // Efek tilt saat mouse bergerak di atas card
  card.addEventListener("mousemove", function (e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  });

  // Reset transform saat mouse keluar dari card
  card.addEventListener("mouseleave", function () {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  });
});
