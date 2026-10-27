// ============================================================
// JavaScript untuk animasi dan interaktivitas portofolio
// ============================================================
// Script dimuat di akhir <body>, sehingga DOM sudah tersedia.
// Seluruh inisialisasi dibungkus "DOMContentLoaded" agar titik
// eksekusi tegas, dan semua kode berada dalam IIFE agar tidak
// memenuhi global scope.
(function () {
  "use strict";

  // Preferensi "reduce motion" dipakai untuk menonaktifkan efek
  // gerakan dekoratif (aksesibilitas; selaras dengan style.css).
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ------------------------------------------------------------
  // Fungsi logika/interaksi
  // ------------------------------------------------------------

  // Fungsi untuk download CV (demo)
  function downloadCV() {
    // Menampilkan alert karena ini hanya demo
    alert("Fitur download CV akan tersedia setelah CV disiapkan!");

    // Dalam implementasi nyata, bisa menggunakan:
    // window.open('path/to/cv.pdf', '_blank');
  }

  // ------------------------------------------------------------
  // Inisialisasi per fitur
  // ------------------------------------------------------------

  // Tombol download CV: pindahan dari onclick inline di HTML,
  // perilaku (alert demo) dipertahankan sama dengan versi asli.
  function initDownloadButton() {
    const downloadButton = document.querySelector(".download-btn");
    if (!downloadButton) return;

    downloadButton.addEventListener("click", downloadCV);
  }

  // Fallback foto profil: bila gambar gagal dimuat, sembunyikan <img>
  // lalu tampilkan emoji sebagai pengganti (perilaku identik dengan
  // handler onerror inline sebelumnya). Dijalankan maksimal satu kali
  // agar tidak terjadi loop error bila fallback pun gagal.
  function initProfileImageFallback() {
    const profileImg = document.querySelector(".profile-img img");
    if (!profileImg) return;

    const showFallback = function () {
      const wrapper = profileImg.parentElement;
      if (!wrapper) return;

      profileImg.style.display = "none";
      wrapper.textContent = "👨‍💻";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.fontSize = "60px";
    };

    profileImg.addEventListener("error", showFallback, { once: true });

    // Jika gambar sudah selesai dimuat (dan gagal) sebelum listener
    // terpasang, jalankan fallback secara langsung.
    if (profileImg.complete && profileImg.naturalWidth === 0) {
      showFallback();
    }
  }

  // Animasi untuk skill tags saat halaman dimuat
  function initSkillTagAnimation() {
    // Lewati animasi dekoratif bila pengguna memilih mengurangi gerakan
    if (prefersReducedMotion) return;

    const skillTags = document.querySelectorAll(".skill-tag");

    // Memberikan delay animasi untuk setiap skill tag
    skillTags.forEach(function (tag, index) {
      tag.style.animationDelay = `${index * 0.1}s`;
      tag.style.animation = "fadeInUp 0.6s ease-out forwards";
    });
  }

  // Smooth scroll effect untuk navigasi (jika ada anchor di halaman ini)
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
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
  }

  // Efek parallax sederhana pada scroll.
  // Query dilakukan sekali di sini, bukan pada setiap event scroll.
  function initParallaxEffect() {
    // Efek dekoratif berbasis scroll — lewati bila reduce motion
    if (prefersReducedMotion) return;

    const header = document.querySelector(".header");
    if (!header) return;

    // [DIUBAH] Dua penyebab stutter dihilangkan:
    // 1) listener { passive: true } — browser tidak perlu menunggu JS
    //    sebelum menggulir (scroll tidak lagi terasa "berat").
    // 2) semua penulisan transform terjadi di satu loop
    //    requestAnimationFrame (maksimal satu kali per frame).
    let rafId = 0;
    // [BARU] Lerp sederhana: target negatif = header bergerak ke ATAS
    // saat scroll, sehingga tidak menutupi .content-grid di bawahnya.
    // Posisi aktual didekati bertahap (~0.15 per frame) agar lompatan
    // scrollY saat address bar Safari iOS menyusut/muncul tidak ikut
    // melompat.
    let currentY = 0;
    let targetY = 0;

    function renderParallax() {
      rafId = 0;
      // Hard-reset di scrollTop 0: jangan biarkan sisa desimal lerp
      // ditulis sebagai posisi sub-piksel yang bisa di-snap Chromium.
      if (window.scrollY === 0 || targetY === 0) {
        currentY = 0;
        targetY = 0;
        header.style.transform = "translateY(0px)";
        return;
      }
      currentY += (targetY - currentY) * 0.15;
      if (Math.abs(targetY - currentY) < 0.1) {
        currentY = targetY;
      }
      // translateY 2D (bukan translate3d) agar .header tidak dipaksa
      // jadi layer GPU terpisah; Math.round menghindari posisi sub-piksel.
      header.style.transform = `translateY(${Math.round(currentY)}px)`;
      if (currentY !== targetY) {
        rafId = window.requestAnimationFrame(renderParallax);
        return;
      }
    }

    window.addEventListener(
      "scroll",
      function () {
        targetY = -(window.scrollY * 0.1);
        if (!rafId) {
          rafId = window.requestAnimationFrame(renderParallax);
        }
      },
      { passive: true }
    );
  }

  // Fungsi untuk menambah interaktivitas pada card (efek tilt)
  function initCardTiltEffect() {
    if (prefersReducedMotion) return;

    document.querySelectorAll(".card").forEach(function (card) {
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
        card.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      });
    });
  }

  // ------------------------------------------------------------
  // Titik masuk tunggal
  // ------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    initSkillTagAnimation();
    initSmoothScroll();
    initParallaxEffect();
    initCardTiltEffect();
    initDownloadButton();
    initProfileImageFallback();
  });
})();
