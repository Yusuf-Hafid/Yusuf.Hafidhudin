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

  // Efek tilt 3D dengan rAF + lerp. JS menulis transform penuh,
  // CSS hanya menyediakan hard-lock layer GPU untuk card.
  function initCardTiltEffect() {
    if (prefersReducedMotion) return;

    const LERP_FACTOR = 0.18;
    const SNAP_THRESHOLD = 0.01;
    const HOVER_LIFT = -5;

    document.querySelectorAll(".card").forEach(function (card) {
      let targetRotateX = 0;
      let targetRotateY = 0;
      let targetTranslateY = 0;

      let currentRotateX = 0;
      let currentRotateY = 0;
      let currentTranslateY = 0;
      let tiltRafId = 0;

      function renderTilt() {
        tiltRafId = 0;

        currentRotateX += (targetRotateX - currentRotateX) * LERP_FACTOR;
        currentRotateY += (targetRotateY - currentRotateY) * LERP_FACTOR;
        currentTranslateY +=
          (targetTranslateY - currentTranslateY) * LERP_FACTOR;

        if (Math.abs(targetRotateX - currentRotateX) < SNAP_THRESHOLD) {
          currentRotateX = targetRotateX;
        }
        if (Math.abs(targetRotateY - currentRotateY) < SNAP_THRESHOLD) {
          currentRotateY = targetRotateY;
        }
        if (Math.abs(targetTranslateY - currentTranslateY) < SNAP_THRESHOLD) {
          currentTranslateY = targetTranslateY;
        }

        // translate3d di akhir menjaga card tetap di layer GPU.
        card.style.transform = `perspective(1000px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translate3d(0, ${currentTranslateY.toFixed(2)}px, 0)`;

        const isSettled =
          currentRotateX === targetRotateX &&
          currentRotateY === targetRotateY &&
          currentTranslateY === targetTranslateY;

        if (!isSettled) {
          tiltRafId = window.requestAnimationFrame(renderTilt);
          return;
        }

        // Setelah leave dan nilai menyentuh 0, lepas inline transform
        // agar card kembali ke base translateZ(0) tanpa layer sisa.
        if (!card.classList.contains("is-tilting")) {
          card.style.transform = "";
        }
      }

      function startTiltLoop() {
        if (!tiltRafId) {
          tiltRafId = window.requestAnimationFrame(renderTilt);
        }
      }

      function activateTilt() {
        if (!card.classList.contains("is-tilting")) {
          card.classList.add("is-tilting");
          targetTranslateY = HOVER_LIFT;
        }
      }

      // Mouse masuk: abaikan event yang terpicu scroll (pointer diam).
      card.addEventListener("mouseenter", function (e) {
        if (e.movementX === 0 && e.movementY === 0) return;
        activateTilt();
        startTiltLoop();
      });

      // Mouse bergerak: guard anti hover-palsu saat scroll, lalu hitung
      // posisi relatif card memakai clientX/clientY (bukan offset child).
      card.addEventListener("mousemove", function (e) {
        if (e.movementX === 0 && e.movementY === 0) return;

        // Fallback bila mouseenter terpicu scroll dan diabaikan.
        activateTilt();

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        targetRotateX = (y - rect.height / 2) / 10;
        targetRotateY = (rect.width / 2 - x) / 10;
        startTiltLoop();
      });

      // Mouse keluar: reset target, biarkan lerp menurunkan card mulus.
      card.addEventListener("mouseleave", function () {
        card.classList.remove("is-tilting");
        targetRotateX = 0;
        targetRotateY = 0;
        targetTranslateY = 0;
        startTiltLoop();
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
