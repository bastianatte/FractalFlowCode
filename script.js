(function () {
  const root = document.documentElement;
  const buttons = Array.from(document.querySelectorAll("[data-lang-target]"));
  const nav = document.querySelector(".site-nav");
  const siteHeader = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);
  const salesCharts = Array.from(document.querySelectorAll("[data-sales-chart]"));
  const pageReveal = document.querySelector(".page-reveal");
  const languageTargets = Array.from(document.querySelectorAll("[data-aria-label-it][data-aria-label-en]"));
  const skipLink = document.querySelector(".skip-link");
  const storageKey = "ffeo-language";

  function renderSalesChart(chart) {
    const bars = Array.from(chart.querySelectorAll("[data-value]"));
    if (!bars.length) {
      return;
    }

    const values = bars.map((bar) => Number(bar.dataset.value) || 0);
    const maxValue = Number(chart.dataset.max) || Math.max(...values);

    bars.forEach((bar) => {
      const value = Number(bar.dataset.value) || 0;
      const height = Math.max((value / maxValue) * 100, 10);
      bar.style.setProperty("--bar-height", `${height}%`);
    });

    const points = values.map((value, index) => {
      const x = values.length === 1 ? 50 : 6 + (index * (88 / (values.length - 1)));
      const y = 90 - ((value / maxValue) * 68);
      return { x, y };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");

    const areaPath = `${linePath} L 94 94 L 6 94 Z`;
    const svgArea = chart.querySelector(".sales-chart-area");

    if (svgArea) {
      svgArea.setAttribute("d", areaPath);
    }
  }

  function initSalesCharts() {
    if (!salesCharts.length) {
      return;
    }

    salesCharts.forEach((chart) => renderSalesChart(chart));

    if ("IntersectionObserver" in window) {
      const chartObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            }
          });
        },
        {
          threshold: 0.35,
        }
      );

      salesCharts.forEach((chart) => chartObserver.observe(chart));
    } else {
      salesCharts.forEach((chart) => chart.classList.add("is-visible"));
    }
  }

  function initPageReveal() {
    if (!pageReveal) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pageReveal.remove();
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.className = "page-reveal-canvas";
    canvas.setAttribute("aria-hidden", "true");
    pageReveal.appendChild(canvas);

    const title = document.createElement("div");
    title.className = "page-reveal-title";
    const titleText = "Fractal Flow Events Ops";
    title.setAttribute("data-wave-text", titleText);
    const titleWords = titleText.split(" ");
    const renderWord = (word) => {
      const letters = [...word]
        .map((letter) => `<span class="page-reveal-letter">${letter}</span>`)
        .join("");
      return `<span class="page-reveal-word">${letters}</span>`;
    };
    title.innerHTML = `
      <span class="page-reveal-line page-reveal-line-top">
        ${titleWords.slice(0, 2).map(renderWord).join('<span class="page-reveal-space">&nbsp;</span>')}
      </span>
      <span class="page-reveal-line page-reveal-line-bottom">
        ${titleWords.slice(2).map(renderWord).join('<span class="page-reveal-space">&nbsp;</span>')}
      </span>`;
    title.setAttribute("aria-hidden", "true");
    pageReveal.appendChild(title);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      window.setTimeout(() => {
        pageReveal.remove();
      }, 7000);
      return;
    }

    const waves = [
      { kind: "sin", color: [72, 214, 255], base: 0.74, amp: 100, freq: 0.010, speed: 1.7, width: 20, blur: 15, alpha: 0.7, phase: 0.2, float: 0.012, floatSpeed: 0.9 },
      { kind: "cos", color: [114, 138, 255], base: 0.68, amp: 92, freq: 0.0115, speed: 1.86, width: 18, blur: 14, alpha: 0.72, phase: 1.4, float: 0.014, floatSpeed: 1.05 },
      { kind: "sin", color: [185, 94, 255], base: 0.62, amp: 88, freq: 0.012, speed: 2.0, width: 17, blur: 14, alpha: 0.74, phase: 2.6, float: 0.016, floatSpeed: 1.18 },
      { kind: "cos", color: [255, 103, 199], base: 0.57, amp: 84, freq: 0.013, speed: 2.14, width: 16, blur: 13, alpha: 0.76, phase: 0.9, float: 0.018, floatSpeed: 0.82 },
      { kind: "sin", color: [255, 179, 71], base: 0.52, amp: 80, freq: 0.014, speed: 2.28, width: 15, blur: 13, alpha: 0.78, phase: 2.1, float: 0.016, floatSpeed: 1.12 },
      { kind: "cos", color: [123, 255, 94], base: 0.47, amp: 76, freq: 0.015, speed: 2.42, width: 14, blur: 12, alpha: 0.76, phase: 0.4, float: 0.014, floatSpeed: 0.98 },
    ];

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`;
    const shade = ([r, g, b], factor) => [
      Math.max(0, Math.min(255, Math.round(r * factor))),
      Math.max(0, Math.min(255, Math.round(g * factor))),
      Math.max(0, Math.min(255, Math.round(b * factor))),
    ];
    const lighten = ([r, g, b], factor) => [
      Math.max(0, Math.min(255, Math.round(r + (255 - r) * factor))),
      Math.max(0, Math.min(255, Math.round(g + (255 - g) * factor))),
      Math.max(0, Math.min(255, Math.round(b + (255 - b) * factor))),
    ];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let stopped = false;

    const resize = () => {
      dpr = Math.max(window.devicePixelRatio || 1, 1);
      width = pageReveal.clientWidth;
      height = pageReveal.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawWave = (wave, time, intensity) => {
      const phase = wave.phase - time * wave.speed;
      const floatOffset = Math.sin(time * wave.floatSpeed + wave.phase) * height * wave.float;
      const baseline = height * wave.base + floatOffset;
      const amplitude = wave.amp * (1 + 0.28 * Math.sin(time * 1.7 + wave.phase * 1.4));

      ctx.beginPath();
      const step = 8;
      for (let x = -80; x <= width + 80; x += step) {
        const theta = x * wave.freq + phase;
        const main = wave.kind === "cos" ? Math.cos(theta) : Math.sin(theta);
        const secondary = Math.sin(theta * 2.1 + wave.phase * 1.7) * 0.46;
        const tertiary = Math.cos(theta * 3.2 - wave.phase * 1.3) * 0.26;
        const y = baseline + amplitude * (main + secondary + tertiary);
        if (x === -80) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      const outerAlpha = intensity * wave.alpha * 0.18;
      const innerAlpha = intensity * wave.alpha;
      const shadowColor = shade(wave.color, 0.38);
      const highlightColor = lighten(wave.color, 0.42);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.translate(0, wave.width * 0.36);
      ctx.shadowColor = rgba(shadowColor, outerAlpha * 0.8);
      ctx.shadowBlur = wave.blur * 1.08;
      ctx.strokeStyle = rgba(shadowColor, outerAlpha * 0.62);
      ctx.lineWidth = wave.width * 3.2;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = wave.blur * 0.7;
      ctx.strokeStyle = rgba(wave.color, innerAlpha * 0.74);
      ctx.lineWidth = wave.width * 1.45;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.translate(0, -wave.width * 0.22);
      ctx.shadowColor = rgba(highlightColor, innerAlpha * 0.5);
      ctx.shadowBlur = wave.blur * 0.3;
      ctx.strokeStyle = rgba(highlightColor, innerAlpha * 0.76);
      ctx.lineWidth = wave.width * 0.72;
      ctx.stroke();
      ctx.shadowBlur = wave.blur * 0.25;
      ctx.strokeStyle = rgba(wave.color, innerAlpha);
      ctx.lineWidth = wave.width;
      ctx.stroke();
      ctx.restore();
    };

    const cleanup = () => {
      if (stopped) {
        return;
      }
      stopped = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (pageReveal && pageReveal.isConnected) {
        pageReveal.classList.add("is-hidden");
        window.setTimeout(() => {
          if (pageReveal && pageReveal.isConnected) {
            pageReveal.remove();
          }
        }, 760);
      }
    };

    const start = performance.now();
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const frame = (now) => {
      if (stopped || !pageReveal || !pageReveal.isConnected) {
        return;
      }

      const time = (now - start) / 1000;
      const fadeIn = clamp((time - 0.65) / 0.4, 0, 1);
      const fadeOut = clamp((5.9 - time) / 0.95, 0, 1);
      const intensity = fadeIn * fadeOut;
      const revealOut = clamp((7 - time) / 0.7, 0, 1);
      const titleVisible = clamp((time - 2) / 0.35, 0, 1) * clamp((7 - time) / 0.7, 0, 1);

      pageReveal.style.opacity = String(revealOut);
      title.classList.toggle("is-visible", time >= 2);
      title.style.opacity = String(titleVisible);
      const words = title.querySelectorAll(".page-reveal-word");
      words.forEach((word, index) => {
        const wordStart = 2 + index * 0.72;
        const wordProgress = clamp((time - wordStart) / 0.34, 0, 1);
        const wordMotion = clamp((wordStart + 2 - time) / 2, 0, 1);
        const motionTime = Math.max(time - wordStart, 0);
        word.style.opacity = String(wordProgress);
        word.style.transform = "none";

        const letters = word.querySelectorAll(".page-reveal-letter");
        letters.forEach((letter, letterIndex) => {
          const letterPhase = index * 0.74 + letterIndex * 0.48;
          const letterY = Math.sin(motionTime * 8.8 + letterPhase) * 13 * wordMotion;
          const letterX = Math.cos(motionTime * 6.3 + letterPhase * 0.82) * 2.5 * wordMotion;
          const tilt = Math.sin(motionTime * 5.1 + letterPhase) * 7.5 * wordMotion;
          const scale = 1 + Math.sin(motionTime * 6.7 + letterPhase) * 0.018 * wordMotion;
          letter.style.opacity = String(wordProgress);
          letter.style.transform = `translate3d(${letterX.toFixed(2)}px, ${letterY.toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        });
      });
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#040406");
      bg.addColorStop(1, "#040406");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      if (time >= 1) {
        for (const wave of waves) {
          drawWave(wave, time - 1, intensity);
        }

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        const fade = ctx.createLinearGradient(0, height * 0.2, 0, height);
        fade.addColorStop(0, "rgba(4, 4, 6, 0)");
        fade.addColorStop(0.6, "rgba(4, 4, 6, 0.16)");
        fade.addColorStop(1, "rgba(4, 4, 6, 0.96)");
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      if (time < 7.05) {
        rafId = requestAnimationFrame(frame);
      } else {
        cleanup();
      }
    };

    rafId = requestAnimationFrame(frame);
    window.setTimeout(cleanup, 7000);
  }

  function initHeaderScrollState() {
    if (!siteHeader) {
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      const shouldHide = currentScrollY > 120 && scrollDelta > 0;

      siteHeader.classList.toggle("is-hidden", shouldHide);
      lastScrollY = currentScrollY;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function setLanguage(lang) {
    const nextLang = lang === "en" ? "en" : "it";
    root.dataset.lang = nextLang;
    root.lang = nextLang;

    if (nav) {
      nav.setAttribute(
        "aria-label",
        nextLang === "it" ? nav.dataset.ariaLabelIt : nav.dataset.ariaLabelEn
      );
    }

    buttons.forEach((button) => {
      const isActive = button.dataset.langTarget === nextLang;
      button.setAttribute("aria-pressed", String(isActive));

      if (button.dataset.langTarget === "it") {
        button.setAttribute("aria-label", isActive ? "Italian language, selected" : "Switch to Italian");
      } else {
        button.setAttribute("aria-label", isActive ? "English language, selected" : "Switch to English");
      }
    });

    languageTargets.forEach((element) => {
      element.setAttribute(
        "aria-label",
        nextLang === "it" ? element.dataset.ariaLabelIt : element.dataset.ariaLabelEn
      );
    });

    if (skipLink) {
      skipLink.setAttribute("aria-label", nextLang === "it" ? "Vai al contenuto" : "Skip to content");
    }

    try {
      localStorage.setItem(storageKey, nextLang);
    } catch (_) {
      // Ignore storage failures in private browsing or restricted environments.
    }
  }

  function setActiveNav(sectionId) {
    navLinks.forEach((link) => {
      if (link.dataset.section === sectionId) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  const savedLang = (() => {
    try {
      return localStorage.getItem(storageKey);
    } catch (_) {
      return null;
    }
  })();

  setLanguage(savedLang || root.dataset.lang || "it");
  initPageReveal();
  initSalesCharts();
  initHeaderScrollState();
  if (sections.length) {
    const hashTarget = location.hash ? location.hash.replace("#", "") : "";
    const initialSection = sections.find((section) => section.id === hashTarget) || sections[0];
    setActiveNav(initialSection.id);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langTarget));
  });

  if (sections.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveNav(visible.target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-28% 0px -55% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else {
    const onScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      let activeId = sections[0]?.id || "";

      for (const section of sections) {
        if (section.offsetTop <= scrollPosition) {
          activeId = section.id;
        }
      }

      if (activeId) {
        setActiveNav(activeId);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveNav(link.dataset.section);
    });
  });
})();
