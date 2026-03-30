(function () {
  const root = document.documentElement;
  const buttons = Array.from(document.querySelectorAll("[data-lang-target]"));
  const nav = document.querySelector(".site-nav");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);
  const salesCharts = Array.from(document.querySelectorAll("[data-sales-chart]"));
  const languageTargets = Array.from(document.querySelectorAll("[data-aria-label-it][data-aria-label-en]"));
  const skipLink = document.querySelector(".skip-link");
  const storageKey = "ffeo-language";

  function renderSalesChart(chart) {
    const bars = Array.from(chart.querySelectorAll("[data-value]"));
    if (!bars.length) {
      return;
    }

    const values = bars.map((bar) => Number(bar.dataset.value) || 0);
    const maxValue = Math.max(...values, 160);

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
  initSalesCharts();
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
