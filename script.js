
/* ==========================================
   KAIROS — INTERACTION & MOTION ENGINE
========================================== */

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const hasGSAP = typeof window.gsap !== "undefined";
const hasScrollTrigger = hasGSAP &&
  typeof window.ScrollTrigger !== "undefined";

if (hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------
   1. HERO ENTRANCE
------------------------------------------ */

function startHeroAnimation() {
  const heroElements = [
    ".hero-topline",
    ".hero-eyebrow",
    ".hero-heading .heading-line > span",
    ".hero-description",
    ".visual-stage",
    ".hero-footer"
  ];

  if (!hasGSAP || reduceMotion) {
    document.querySelectorAll(heroElements.join(",")).forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });

    return;
  }

  const timeline = gsap.timeline({
    defaults: {
      ease: "power4.out"
    }
  });

  timeline
    .fromTo(".hero-topline",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo(".hero-eyebrow",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7 },
      "-=0.4"
    )
    .fromTo(".hero-heading .heading-line > span",
      { yPercent: 115, rotate: 3 },
      {
        yPercent: 0,
        rotate: 0,
        duration: 1.1,
        stagger: 0.12
      },
      "-=0.35"
    )
    .fromTo(".hero-description",
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.5"
    )
    .fromTo(".visual-stage",
      { opacity: 0, scale: 0.88, rotate: -5 },
      {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 1.4,
        ease: "power3.out"
      },
      "-=1"
    )
    .fromTo(".hero-footer",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7 },
      "-=0.5"
    );
}

/* ------------------------------------------
   2. SCROLL-TRIGGERED REVEALS
------------------------------------------ */

function setupScrollReveals() {
  const elements = document.querySelectorAll(".reveal");

  if (hasScrollTrigger && !reduceMotion) {
    elements.forEach((element) => {
      gsap.fromTo(element,
        {
          opacity: 0,
          y: 45
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          }
        }
      );
    });

    return;
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    elements.forEach((element) => observer.observe(element));
  } else {
    elements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }
}

/* ------------------------------------------
   3. INTERACTIVE ARTWORK
------------------------------------------ */

function setupArtwork() {
  const stage = document.querySelector(".visual-stage");
  const sculpture = document.querySelector(".sculpture");

  if (!stage || !sculpture || reduceMotion) return;

  if (hasGSAP) {
    const moveX = gsap.quickTo(sculpture, "x", {
      duration: 0.7,
      ease: "power3.out"
    });

    const moveY = gsap.quickTo(sculpture, "y", {
      duration: 0.7,
      ease: "power3.out"
    });

    const rotateY = gsap.quickTo(sculpture, "rotationY", {
      duration: 0.7,
      ease: "power3.out"
    });

    const rotateX = gsap.quickTo(sculpture, "rotationX", {
      duration: 0.7,
      ease: "power3.out"
    });

    stage.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;

      const rect = stage.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      moveX(x * 24);
      moveY(y * 24);
      rotateY(x * 12);
      rotateX(-y * 12);
    });

    stage.addEventListener("pointerleave", () => {
      moveX(0);
      moveY(0);
      rotateY(0);
      rotateX(0);
    });

  } else {
    stage.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;

      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      sculpture.style.translate =
        `${x * 24}px ${y * 24}px`;
    });

    stage.addEventListener("pointerleave", () => {
      sculpture.style.translate = "0 0";
    });
  }
}

/* ------------------------------------------
   4. SUBTLE ORBIT MOVEMENT
------------------------------------------ */

function setupOrbitMotion() {
  if (!hasGSAP || reduceMotion) return;

  gsap.to(".orbit-one", {
    rotation: 330,
    duration: 28,
    repeat: -1,
    ease: "none",
    transformOrigin: "center center"
  });

  gsap.to(".orbit-two", {
    rotation: 410,
    duration: 38,
    repeat: -1,
    ease: "none",
    transformOrigin: "center center"
  });

  gsap.to(".orbit-three", {
    rotation: 395,
    duration: 45,
    repeat: -1,
    ease: "none",
    transformOrigin: "center center"
  });
}

/* ------------------------------------------
   5. SCROLL-BASED ARTWORK MOVEMENT
------------------------------------------ */

function setupParallax() {
  if (!hasScrollTrigger || reduceMotion) return;

  gsap.to(".visual-stage", {
    y: 75,
    scale: 0.92,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1
    }
  });
}

/* ------------------------------------------
   6. NAVIGATION
------------------------------------------ */

function setupNavigation() {
  const navigation = document.querySelector(".navigation");
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!navigation) return;

  const updateNavigation = () => {
    navigation.classList.toggle(
      "is-scrolled",
      window.scrollY > 40
    );
  };

  updateNavigation();

  window.addEventListener("scroll", updateNavigation, {
    passive: true
  });

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      menuButton.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );

      navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }
}

/* ------------------------------------------
   7. MAGNETIC BUTTONS
------------------------------------------ */

function setupMagneticButtons() {
  if (!hasGSAP || reduceMotion) return;

  if (window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();

      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.12,
        y: y * 0.12,
        duration: 0.4,
        ease: "power3.out"
      });
    });

    button.addEventListener("pointerleave", () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
      });
    });
  });
}

/* ------------------------------------------
   8. INITIALIZE
------------------------------------------ */

function initializeKairos() {
  setupNavigation();

  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("is-visible");
    });
  } else {
    setupScrollReveals();
  }

  startHeroAnimation();
  setupArtwork();
  setupOrbitMotion();
  setupParallax();
  setupMagneticButtons();

  console.log(
    "KAIROS initialized.",
    hasGSAP ? "GSAP enabled." : "Using fallback motion."
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeKairos);
} else {
  initializeKairos();
}
