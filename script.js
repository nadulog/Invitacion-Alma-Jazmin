(() => {
  const EVENT_START = "2026-11-22T21:00:00-03:00";
  const EVENT_END = "2026-11-23T05:00:00-03:00";
  const PLAYLIST_URL = "https://open.spotify.com/playlist/7C9Qj0Sg3bYelh3qELK28q?si=KvDDHUM7RrKHbnpU1aH_Ng&utm_source=whatsapp&pi=zI6WSrWCStm29&pt=e8e185596cf128e6bacad5d488c2b331";
  const target = new Date(EVENT_START).getTime();
  const units = Object.fromEntries([...document.querySelectorAll("[data-unit]")].map(node => [node.dataset.unit, node]));

  function tick() {
    const total = Math.max(0, target - Date.now());
    const seconds = Math.floor(total / 1000);
    const values = {
      days: String(Math.floor(seconds / 86400)),
      hours: String(Math.floor(seconds / 3600) % 24).padStart(2, "0"),
      minutes: String(Math.floor(seconds / 60) % 60).padStart(2, "0"),
      seconds: String(seconds % 60).padStart(2, "0")
    };
    Object.entries(values).forEach(([unit, value]) => {
      if (units[unit].textContent === value) return;
      units[unit].textContent = value;
      units[unit].classList.remove("tick-pop");
      void units[unit].offsetWidth;
      units[unit].classList.add("tick-pop");
    });
  }
  tick();
  setInterval(tick, 1000);

  const countdownPanel = document.querySelector(".countdown-panel");
  if ("IntersectionObserver" in window) {
    const countdownObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countdownPanel.classList.add("is-visible");
        countdownObserver.disconnect();
      });
    }, { threshold: .32 });
    countdownObserver.observe(countdownPanel);
  } else {
    countdownPanel.classList.add("is-visible");
  }

  const utc = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Alma Jazmin XV//ES", "BEGIN:VEVENT", "UID:alma-jazmin-xv-20261122@invitacion", `DTSTART:${utc(EVENT_START)}`, `DTEND:${utc(EVENT_END)}`, "SUMMARY:Mis XV de Alma Jazmín", "LOCATION:Jano’s San Martín\\, Gral. Lavalle 8101\\, Tres de Febrero", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  document.querySelector(".calendar-hotspot").href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));

  const locationModal = document.querySelector(".location-modal");
  const locationCopyStatus = document.querySelector(".location-copy-status");
  document.querySelector("[data-open-location]").addEventListener("click", () => locationModal.showModal());
  document.querySelector("[data-close-location]").addEventListener("click", () => locationModal.close());
  locationModal.addEventListener("click", event => {
    if (event.target === locationModal) locationModal.close();
  });
  document.querySelector("[data-copy-address]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("Gral. Lavalle 8101, Tres de Febrero");
      locationCopyStatus.textContent = "DIRECCIÓN COPIADA";
    } catch {
      locationCopyStatus.textContent = "GRAL. LAVALLE 8101, TRES DE FEBRERO";
    }
  });

  const galleryPanel = document.querySelector(".gallery-panel");
  const galleryLightbox = document.querySelector(".gallery-lightbox");
  const galleryLightboxImage = galleryLightbox.querySelector("img");
  if (!galleryPanel.hidden) new IntersectionObserver(entries => {
    entries.forEach(entry => galleryPanel.classList.toggle("is-visible", entry.isIntersecting));
  }, { threshold: .22 }).observe(galleryPanel);
  document.querySelectorAll("[data-gallery-src]").forEach(photo => {
    photo.addEventListener("click", () => {
      galleryLightboxImage.src = photo.dataset.gallerySrc;
      galleryLightboxImage.alt = photo.querySelector("img").alt;
      galleryLightbox.showModal();
    });
  });
  document.querySelector("[data-close-gallery]").addEventListener("click", () => galleryLightbox.close());
  galleryLightbox.addEventListener("click", event => {
    if (event.target === galleryLightbox) galleryLightbox.close();
  });

  const giftModal = document.querySelector(".gift-modal");
  const openGifts = document.querySelector("[data-open-gifts]");
  const closeGifts = document.querySelector("[data-close-gifts]");
  const copyAlias = document.querySelector("[data-copy-alias]");
  const copyStatus = document.querySelector(".copy-status");
  openGifts.addEventListener("click", () => giftModal.showModal());
  closeGifts.addEventListener("click", () => giftModal.close());
  giftModal.addEventListener("click", event => {
    if (event.target === giftModal) giftModal.close();
  });
  copyAlias.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("almajazmin11.mp");
      copyStatus.textContent = "ALIAS COPIADO";
    } catch {
      copyStatus.textContent = "ALIAS: almajazmin11.mp";
    }
  });

  const musicPanel = document.querySelector(".music-panel");
  const playlistButton = document.querySelector(".playlist-button");
  if (PLAYLIST_URL) playlistButton.href = PLAYLIST_URL;
  const musicObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => musicPanel.classList.toggle("is-visible", entry.isIntersecting));
  }, { threshold: 0.05 });
  musicObserver.observe(musicPanel);

  const backgroundMusic = document.querySelector("#backgroundMusic");
  const audioToggle = document.querySelector(".audio-toggle");
  audioToggle.addEventListener("click", async () => {
    if (backgroundMusic.paused) {
      try {
        await backgroundMusic.play();
      } catch {
        return;
      }
    } else {
      backgroundMusic.pause();
    }
  });
  const syncAudioButton = () => {
    const isPlaying = !backgroundMusic.paused;
    audioToggle.classList.toggle("is-playing", isPlaying);
    audioToggle.setAttribute("aria-pressed", String(isPlaying));
    audioToggle.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
    audioToggle.querySelector(".audio-toggle__icon").textContent = isPlaying ? "Ⅱ" : "♪";
  };
  backgroundMusic.addEventListener("play", syncAudioButton);
  backgroundMusic.addEventListener("pause", syncAudioButton);

  const invitationIntro = document.querySelector(".invitation-intro");
  const enterInvitation = async withMusic => {
    if (withMusic) {
      try {
        await backgroundMusic.play();
      } catch {
        // La invitación igualmente se abre si el navegador bloquea el audio.
      }
    } else {
      backgroundMusic.pause();
    }
    invitationIntro.classList.add("is-bursting");
    window.setTimeout(() => {
      invitationIntro.classList.add("is-leaving");
      document.body.classList.remove("intro-open");
      window.setTimeout(() => {
        invitationIntro.hidden = true;
      }, 760);
    }, 520);
  };
  document.querySelector("[data-enter-with-music]").addEventListener("click", () => enterInvitation(true));
  const enterWithoutMusicButton = document.querySelector("[data-enter-without-music]");
  enterWithoutMusicButton.addEventListener("click", () => enterInvitation(false));

  // Intenta arrancar la música al abrir; si el navegador lo bloquea, arranca con el primer toque.
  const unlockEvents = ["pointerdown", "touchend", "keydown", "click"];
  const removeUnlockListeners = () => unlockEvents.forEach(type => document.removeEventListener(type, unlockMusic, true));
  function unlockMusic(event) {
    if (enterWithoutMusicButton.contains(event.target) || audioToggle.contains(event.target) || !backgroundMusic.paused) {
      removeUnlockListeners();
      return;
    }
    backgroundMusic.play().then(removeUnlockListeners).catch(() => {});
  }
  backgroundMusic.play().catch(() => {
    unlockEvents.forEach(type => document.addEventListener(type, unlockMusic, { capture: true, passive: true }));
  });
})();
