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

    try {
      if (sessionStorage.getItem("ffeo-reveal-seen") === "1") {
        pageReveal.remove();
        return;
      }
      sessionStorage.setItem("ffeo-reveal-seen", "1");
    } catch (_) {
      // Ignore storage failures in private browsing.
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
      { kind: "sin", color: [132, 236, 255], base: 0.66, amp: 96, freq: 0.011, speed: 1.8, width: 18, blur: 14, alpha: 0.78, phase: 0.2, float: 0.012, floatSpeed: 0.9 },
      { kind: "cos", color: [184, 212, 255], base: 0.56, amp: 86, freq: 0.0125, speed: 2.0, width: 16, blur: 13, alpha: 0.72, phase: 1.6, float: 0.014, floatSpeed: 1.05 },
      { kind: "sin", color: [210, 236, 255], base: 0.46, amp: 76, freq: 0.014, speed: 2.2, width: 14, blur: 12, alpha: 0.66, phase: 2.8, float: 0.016, floatSpeed: 1.18 },
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

    const TOTAL = 2.6;
    const WAVES_START = 0.3;
    const TITLE_START = 0.7;

    const frame = (now) => {
      if (stopped || !pageReveal || !pageReveal.isConnected) {
        return;
      }

      const time = (now - start) / 1000;
      const fadeIn = clamp((time - WAVES_START) / 0.3, 0, 1);
      const fadeOut = clamp((TOTAL - 0.4 - time) / 0.5, 0, 1);
      const intensity = fadeIn * fadeOut;
      const revealOut = clamp((TOTAL - time) / 0.5, 0, 1);
      const titleVisible = clamp((time - TITLE_START) / 0.3, 0, 1) * clamp((TOTAL - time) / 0.5, 0, 1);

      pageReveal.style.opacity = String(revealOut);
      title.classList.toggle("is-visible", time >= TITLE_START);
      title.style.opacity = String(titleVisible);
      const words = title.querySelectorAll(".page-reveal-word");
      words.forEach((word, index) => {
        const wordStart = TITLE_START + index * 0.16;
        const wordProgress = clamp((time - wordStart) / 0.28, 0, 1);
        const wordMotion = clamp((TOTAL - 0.4 - time) / 0.8, 0, 1);
        const motionTime = Math.max(time - wordStart, 0);
        word.style.opacity = String(wordProgress);
        word.style.transform = "none";

        const letters = word.querySelectorAll(".page-reveal-letter");
        letters.forEach((letter, letterIndex) => {
          const letterPhase = index * 0.74 + letterIndex * 0.42;
          const letterY = Math.sin(motionTime * 6.2 + letterPhase) * 4 * wordMotion;
          const tilt = Math.sin(motionTime * 4.4 + letterPhase) * 2 * wordMotion;
          letter.style.opacity = String(wordProgress);
          letter.style.transform = `translate3d(0, ${letterY.toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
        });
      });
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#040406";
      ctx.fillRect(0, 0, width, height);

      if (time >= WAVES_START) {
        for (const wave of waves) {
          drawWave(wave, time - WAVES_START, intensity);
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

      if (time < TOTAL + 0.1) {
        rafId = requestAnimationFrame(frame);
      } else {
        cleanup();
      }
    };

    rafId = requestAnimationFrame(frame);
    window.setTimeout(cleanup, (TOTAL + 0.1) * 1000);
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

  function initPopovers() {
    const triggers = Array.from(document.querySelectorAll("[data-popover]"));
    if (!triggers.length) return;

    const popover = document.createElement("div");
    popover.className = "ffeo-popover";
    popover.setAttribute("aria-hidden", "true");
    document.body.appendChild(popover);

    let hideTimer = null;
    let counterInterval = null;

    function getLang() {
      return root.dataset.lang === "en" ? "en" : "it";
    }

    function renderContent(type) {
      const lang = getLang();
      if (type === "sales-line") {
        const label = lang === "it" ? "Andamento vendite" : "Sales trend";
        return `<p class="pop-title">${label}</p>
          <svg class="pop-svg" viewBox="0 0 170 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polyline class="pop-line" points="8,46 32,38 58,40 84,22 110,28 136,12 162,6"
              stroke="#84ecff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle class="pop-dot" cx="8" cy="46" r="3" fill="#84ecff" style="animation-delay:0.5s"/>
            <circle class="pop-dot" cx="84" cy="22" r="3" fill="#84ecff" style="animation-delay:0.9s"/>
            <circle class="pop-dot" cx="162" cy="6" r="3.5" fill="#84ecff" style="animation-delay:1.2s"/>
          </svg>`;
      }
      if (type === "access-counter") {
        const title = lang === "it" ? "Accessi in tempo reale" : "Real-time access";
        const label = lang === "it" ? "scansioni / ora" : "scans / hour";
        return `<p class="pop-title">${title}</p>
          <div class="pop-counter">
            <span class="pop-counter-num" data-pop-count="4821">0</span>
            <span class="pop-counter-label">${label}</span>
          </div>`;
      }
      if (type === "checklist") {
        const title = lang === "it" ? "Stato preparazione" : "Preparation status";
        const items = lang === "it"
          ? ["Selezione team", "Assegnazione turni", "Formazione completata"]
          : ["Team selection", "Shift assignment", "Training complete"];
        return `<p class="pop-title">${title}</p>
          <ul class="pop-checklist">
            ${items.map((item) => `<li class="pop-check">${item}</li>`).join("")}
          </ul>`;
      }
      if (type === "kpi-dashboard") {
        const title = lang === "it" ? "KPI evento" : "Event KPIs";
        const trend = lang === "it" ? "vs evento precedente" : "vs previous event";
        return `<p class="pop-title">${title}</p>
          <div class="pop-kpi">
            <div class="pop-kpi-main">
              <span class="pop-kpi-num" data-pop-count="9420" data-pop-prefix="">0</span>
              <span class="pop-kpi-trend">↑ +18%</span>
            </div>
            <span class="pop-kpi-sub">${lang === "it" ? "presenze totali" : "total attendance"}</span>
            <svg class="pop-svg pop-kpi-spark" viewBox="0 0 170 36" fill="none" aria-hidden="true">
              <polyline class="pop-line" points="6,28 30,22 54,24 78,14 102,18 126,8 150,4 164,6"
                stroke="#84ecff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="pop-kpi-trend-label">${trend}</span>
          </div>`;
      }
      if (type === "gate-capacity") {
        const title = lang === "it" ? "Capacità ingressi" : "Gate capacity";
        const gates = lang === "it"
          ? [["Ingresso Nord", 847, 1200], ["Ingresso Sud", 612, 1000], ["VIP", 94, 120]]
          : [["North Gate", 847, 1200], ["South Gate", 612, 1000], ["VIP", 94, 120]];
        return `<p class="pop-title">${title}</p>
          <div class="pop-gates">
            ${gates.map((g, i) => `
              <div class="pop-gate-row" style="animation-delay:${(i * 0.2).toFixed(2)}s">
                <div class="pop-gate-header">
                  <span class="pop-gate-name">${g[0]}</span>
                  <span class="pop-gate-count">${g[1].toLocaleString("it-IT")} / ${g[2].toLocaleString("it-IT")}</span>
                </div>
                <div class="pop-progress-track">
                  <div class="pop-gate-fill" style="--pct:${Math.round((g[1]/g[2])*100)}%;--delay:${(i * 0.2 + 0.15).toFixed(2)}s"></div>
                </div>
              </div>`).join("")}
          </div>`;
      }
      if (type === "issue-dots") {
        const title = lang === "it" ? "Stato criticità" : "Issue status";
        const items = lang === "it"
          ? ["Coda ingresso nord", "Scanner offline", "Accesso VIP"]
          : ["North gate queue", "Scanner offline", "VIP access"];
        return `<p class="pop-title">${title}</p>
          <ul class="pop-checklist">
            ${items.map((item) => `<li class="pop-check pop-issue">${item}</li>`).join("")}
          </ul>`;
      }
      if (type === "status-board") {
        const title = lang === "it" ? "Stato team" : "Team status";
        const teams = lang === "it"
          ? [["Prevendita online", "in-wait", "Attivo"], ["Cassa on-site", "in-progress", "Attivo"], ["Pagamenti", "active", "Attivo"]]
          : [["Online presales", "in-wait", "Active"], ["On-site box office", "in-progress", "Active"], ["Payments", "active", "Active"]];
        return `<p class="pop-title">${title}</p>
          <div class="pop-status-list">
            ${teams.map((t, i) => `
              <div class="pop-status-row" style="animation-delay:${(i * 0.22).toFixed(2)}s">
                <span class="pop-status-dot pop-status-${t[1]}" data-status-to="${i < 2 ? "active" : ""}" style="transition-delay:${(i * 0.22 + 0.6).toFixed(2)}s"></span>
                <span class="pop-status-name">${t[0]}</span>
                <span class="pop-status-label pop-status-label-${t[1]}" data-label-to="${i < 2 ? t[2] : ""}" style="transition-delay:${(i * 0.22 + 0.6).toFixed(2)}s">${i === 2 ? t[2] : (lang === "it" ? "In attesa" : "Standby")}</span>
              </div>`).join("")}
          </div>`;
      }
      if (type === "ledger") {
        const title = lang === "it" ? "Registro di cassa" : "Cash ledger";
        const rows = lang === "it"
          ? [["Biglietti", "8.420"], ["Bar & Food", "2.180"], ["Merchandising", "640"]]
          : [["Tickets", "8.420"], ["Bar & Food", "2.180"], ["Merchandise", "640"]];
        const totalLabel = lang === "it" ? "TOTALE" : "TOTAL";
        return `<p class="pop-title">${title}</p>
          <div class="pop-ledger">
            ${rows.map((r, i) => `
              <div class="pop-ledger-row" style="animation-delay:${(i * 0.22).toFixed(2)}s">
                <span class="pop-ledger-item">${r[0]}</span>
                <span class="pop-ledger-amount">€ ${r[1]}</span>
              </div>`).join("")}
            <div class="pop-ledger-divider" style="animation-delay:0.72s"></div>
            <div class="pop-ledger-row pop-ledger-total" style="animation-delay:0.82s">
              <span class="pop-ledger-item">${totalLabel}</span>
              <span class="pop-ledger-amount" data-pop-count="11240" data-pop-prefix="€ ">€ 0</span>
            </div>
          </div>`;
      }
      if (type === "followup") {
        const title = lang === "it" ? "Attività post-evento" : "Post-event activity";
        const rows = lang === "it"
          ? [["Database", "+842"], ["Email", "+124"], ["Rimborsi", "+12"]]
          : [["Database", "+842"], ["Emails", "+124"], ["Refunds", "+12"]];
        return `<p class="pop-title">${title}</p>
          <div class="pop-notif-list">
            ${rows.map((r, i) => `
              <div class="pop-notif-row" style="animation-delay:${(i * 0.18).toFixed(2)}s">
                <span class="pop-notif-label">${r[0]}</span>
                <span class="pop-notif-badge">${r[1]}</span>
              </div>`).join("")}
          </div>`;
      }
      return "";
    }

    function runAnimations(type) {
      if (type === "access-counter" || type === "gate-scan" || type === "ledger") {
        const el = popover.querySelector("[data-pop-count]");
        if (!el) return;
        const target = parseInt(el.dataset.popCount, 10);
        const prefix = el.dataset.popPrefix || "";
        const startDelay = type === "ledger" ? 900 : 0;
        setTimeout(() => {
          let current = 0;
          const step = Math.ceil(target / 38);
          clearInterval(counterInterval);
          counterInterval = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = prefix + current.toLocaleString("it-IT");
            if (current >= target) clearInterval(counterInterval);
          }, 28);
        }, startDelay);
      }
      if (type === "checklist" || type === "followup") {
        const items = popover.querySelectorAll(".pop-check");
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add("is-checked"), 250 + i * 320);
        });
      }
      if (type === "issue-dots") {
        const items = popover.querySelectorAll(".pop-issue");
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add("is-resolved"), 300 + i * 400);
        });
      }
      if (type === "status-board") {
        const dots = popover.querySelectorAll("[data-status-to]");
        const labels = popover.querySelectorAll("[data-label-to]");
        dots.forEach((dot, i) => {
          const to = dot.dataset.statusTo;
          if (!to) return;
          setTimeout(() => dot.classList.add("pop-status-active"), 600 + i * 220);
        });
        labels.forEach((label, i) => {
          const to = label.dataset.labelTo;
          if (!to) return;
          setTimeout(() => { label.textContent = to; label.classList.add("pop-status-label-active"); }, 600 + i * 220);
        });
      }
      if (type === "kpi-dashboard") {
        const el = popover.querySelector("[data-pop-count]");
        if (!el) return;
        const target = parseInt(el.dataset.popCount, 10);
        let current = 0;
        const step = Math.ceil(target / 38);
        clearInterval(counterInterval);
        counterInterval = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current.toLocaleString("it-IT");
          if (current >= target) clearInterval(counterInterval);
        }, 28);
      }
    }

    function show(trigger) {
      clearTimeout(hideTimer);
      clearInterval(counterInterval);
      const type = trigger.dataset.popover;
      popover.innerHTML = renderContent(type);
      popover.style.visibility = "hidden";
      popover.style.opacity = "0";
      popover.style.transform = "none";
      popover.style.top = "-9999px";
      popover.style.left = "-9999px";
      document.body.appendChild(popover);

      requestAnimationFrame(() => {
        const rect = trigger.getBoundingClientRect();
        const popWidth = 210;
        const popHeight = popover.offsetHeight;
        let left = rect.left + rect.width / 2 - popWidth / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - popWidth - 8));
        let top = rect.top - popHeight - 12;
        if (top < 8) top = rect.bottom + 10;
        popover.style.width = popWidth + "px";
        popover.style.left = left + "px";
        popover.style.top = top + "px";
        popover.style.visibility = "";
        popover.style.opacity = "";
        popover.style.transform = "";
        popover.classList.add("is-visible");
        runAnimations(type);
      });
    }

    function hide() {
      clearInterval(counterInterval);
      popover.classList.remove("is-visible");
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener("mouseenter", () => show(trigger));
      trigger.addEventListener("mouseleave", () => {
        hideTimer = setTimeout(hide, 80);
      });
    });
  }

  function initStarStrip() {
    const strip = document.querySelector(".clients-strip");
    if (!strip) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;";
    strip.insertBefore(canvas, strip.firstChild);

    const ctx = canvas.getContext("2d");
    let stars = [];

    const starColors = [
      [255, 255, 255],
      [220, 200, 255],
      [180, 220, 255],
      [200, 60, 255],
      [0, 220, 255],
    ];

    function resize() {
      canvas.width = strip.offsetWidth;
      canvas.height = strip.offsetHeight;
      const count = Math.floor((canvas.width * canvas.height) / 600);
      stars = Array.from({ length: count }, () => {
        const col = starColors[Math.floor(Math.random() * starColors.length)];
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.1 + 0.2,
          baseAlpha: Math.random() * 0.45 + 0.10,
          speed: Math.random() * 0.006 + 0.002,
          phase: Math.random() * Math.PI * 2,
          col,
        };
      });
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const alpha = Math.max(0, Math.min(1, s.baseAlpha + Math.sin(t * s.speed + s.phase) * 0.25));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);
  }

  function initCounters() {
    const stats = Array.from(document.querySelectorAll(".stat-number[data-target]"));
    if (!stats.length) return;

    const countUp = (el) => {
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || "0");
      const suffix = el.dataset.suffix || "";
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString("it-IT")) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach((el) => observer.observe(el));
  }

  setLanguage(savedLang || root.dataset.lang || "it");

  (function syncTickerHeight() {
    const ticker = document.querySelector(".live-ticker");
    if (!ticker) return;
    const update = () =>
      root.style.setProperty("--ticker-height", ticker.offsetHeight + "px");
    update();
    window.addEventListener("resize", update, { passive: true });
  })();

  initPageReveal();
  initSalesCharts();
  initHeaderScrollState();
  initPopovers();
  initCounters();
  initStarStrip();

  (function initServiceGlyphs() {
    const cards = document.querySelectorAll(".service-card");
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモラリルレロワヲンΔΨΦΩΣΛΘΠ⌬⍟⊕⊗◈✦⟁∴∵⋮⋯╬╪╫░▒▓";

    cards.forEach((card) => {
      let container = null;
      let fadeTimer = null;

      card.addEventListener("mouseenter", () => {
        if (container) container.remove();
        clearTimeout(fadeTimer);

        container = document.createElement("div");
        container.className = "service-glyphs";
        card.appendChild(container);

        const count = 42;
        for (let i = 0; i < count; i++) {
          const span = document.createElement("span");
          span.className = "service-glyph";
          span.textContent = chars[Math.floor(Math.random() * chars.length)];

          const x = 3 + Math.random() * 88;
          const y = Math.random() * 95;
          const op = (0.45 + Math.random() * 0.4).toFixed(2);
          const dur = (0.55 + Math.random() * 0.45).toFixed(2);
          const size = (0.62 + Math.random() * 0.34).toFixed(2);

          span.style.left = x + "%";
          span.style.top = y + "%";
          span.style.fontSize = size + "rem";
          span.style.setProperty("--glyph-op", op);
          span.style.setProperty("--glyph-dur", dur + "s");
          span.style.animationDelay = ((y / 100) * 0.52 + Math.random() * 0.06).toFixed(3) + "s";

          container.appendChild(span);
        }
      });

      card.addEventListener("mouseleave", () => {
        if (!container) return;
        container.style.opacity = "0";
        fadeTimer = setTimeout(() => {
          if (container) { container.remove(); container = null; }
        }, 280);
      });
    });
  })();

  (function initStars() {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:-1;";
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");
    const starColors = [[255,255,255],[220,200,255],[180,220,255],[200,60,255],[0,220,255]];
    let stars = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.floor((canvas.width * canvas.height) / 600);
      stars = Array.from({ length: count }, () => {
        const col = starColors[Math.floor(Math.random() * starColors.length)];
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.3 + 0.2,
          baseAlpha: Math.random() * 0.45 + 0.06,
          speed: Math.random() * 0.005 + 0.002,
          phase: Math.random() * Math.PI * 2,
          col,
        };
      });
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const alpha = Math.max(0, Math.min(1, s.baseAlpha + Math.sin(t * s.speed + s.phase) * 0.28));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);
  })();

  (function initHeroGlitch() {
    const h1 = document.querySelector(".hero-copy h1");
    const brandText = document.querySelector(".brand-text");

    if (h1) {
      function glitchH1() {
        h1.classList.add("glitching");
        setTimeout(() => h1.classList.remove("glitching"), 560);
        setTimeout(glitchH1, 1500 + Math.random() * 2000);
      }
      setTimeout(glitchH1, 1000 + Math.random() * 1000);
    }

    if (brandText) {
      function glitchBrand() {
        brandText.classList.add("glitching");
        setTimeout(() => brandText.classList.remove("glitching"), 650);
        if (Math.random() > 0.55) {
          setTimeout(() => {
            brandText.classList.add("glitching");
            setTimeout(() => brandText.classList.remove("glitching"), 650);
          }, 750);
        }
        setTimeout(glitchBrand, 900 + Math.random() * 1400);
      }
      setTimeout(glitchBrand, 1000 + Math.random() * 600);
    }
  })();

  (function initDashboard() {
    const feed      = document.getElementById("dash-feed");
    const elScanned = document.getElementById("dash-scanned");
    const elRate    = document.getElementById("dash-rate");
    const elCap     = document.getElementById("dash-capacity");
    const elBar     = document.getElementById("dash-gate-bar");
    const elPct     = document.getElementById("dash-gate-pct");
    if (!feed) return;

    const TOTAL = 5800;
    let scanned = 3241;
    let rate    = 87;

    function pad(n) { return String(n).padStart(2, "0"); }
    function nowTime() {
      const d = new Date();
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    function fmt(n) { return n.toLocaleString("it-IT"); }

    function updateKPIs() {
      elScanned.textContent = fmt(scanned);
      elRate.innerHTML = `${rate}<span class="dashboard-kpi-unit">/h</span>`;
      const pct = Math.min(Math.round((scanned / TOTAL) * 100), 100);
      elCap.innerHTML = `${pct}<span class="dashboard-kpi-unit">%</span>`;
      elBar.style.width = pct + "%";
      elPct.textContent = pct + "%";
    }

    function addFeedRow(ticket) {
      const rows = feed.querySelectorAll(".dashboard-feed-row");
      rows.forEach(r => r.classList.add("dimmed"));
      if (rows.length >= 4) rows[rows.length - 1].remove();

      const row = document.createElement("div");
      row.className = "dashboard-feed-row";
      row.innerHTML = `
        <span class="dashboard-feed-time">${nowTime()}</span>
        <span class="dashboard-feed-gate">Gate</span>
        <span class="dashboard-feed-ticket">#${ticket}</span>
        <span class="dashboard-feed-ok">✓</span>`;
      feed.insertBefore(row, feed.firstChild);
    }

    function tick() {
      const delta = Math.floor(Math.random() * 3) + 1;
      scanned += delta;
      rate = Math.max(40, Math.min(150, rate + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 8)));
      for (let i = 0; i < delta; i++) addFeedRow(scanned - i);
      updateKPIs();
    }

    updateKPIs();
    addFeedRow(scanned);
    addFeedRow(scanned - 1);
    addFeedRow(scanned - 2);
    setInterval(tick, 2800);
  })();

  (function initLiveTicker() {
    const ticker = document.querySelector(".live-ticker-text");
    if (!ticker) return;

    const gates = ["Gate"];
    const events = [
      (n, g, t) => `🎫 Biglietto #${n} scansionato · ${t} · ${g}`,
      (n, g, t) => `✅ Accesso confermato · #${n} · ${t} · ${g}`,
      (n, g, t) => `🎟️ Check-in completato · ${g} · ${t}`,
      (n, g, t) => `📲 Biglietto #${n} validato · ${t} · ${g}`,
    ];

    function randomTicket() { return Math.floor(3200 + Math.random() * 9800); }
    function randomGate()   { return gates[Math.floor(Math.random() * gates.length)]; }
    function randomTime()   {
      const h = String(Math.floor(Math.random() * 6) + 18).padStart(2, "0");
      const m = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      const s = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      return `${h}:${m}:${s}`;
    }

    function next() {
      const fn = events[Math.floor(Math.random() * events.length)];
      ticker.classList.add("fade");
      setTimeout(() => {
        ticker.textContent = fn(randomTicket(), randomGate(), randomTime());
        ticker.classList.remove("fade");
      }, 400);
    }

    next();
    setInterval(next, 3200);
  })();
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
