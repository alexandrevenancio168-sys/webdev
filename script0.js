    /* =========================================================
   CONFIGURAÇÃO — altera só esta parte
========================================================= */

const SITE = {
    // número com indicativo, só dígitos. Ex.: "244923000000"
    whatsapp: "244932927427",

    // links das redes sociais ("#" = ainda sem link)
    socials: {
        instagram: "#",
        facebook: "#",
        tiktok: "#"
    },

    defaultMessage: "Olá! Quero uma landing page."
};

const WHATSAPP_OK = /^\d{9,15}$/.test(SITE.whatsapp);

document.addEventListener("DOMContentLoaded", () => {

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =====================================================
       LINKS DE WHATSAPP E REDES SOCIAIS
    ===================================================== */

    document.querySelectorAll("[data-whatsapp]").forEach((link) => {
        if (!WHATSAPP_OK) return; // mantém o href original (âncora)
        const message = link.dataset.message || SITE.defaultMessage;
        link.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(message);
        link.target = "_blank";
        link.rel = "noopener";
    });

    document.querySelectorAll("[data-social]").forEach((link) => {
        const url = SITE.socials[link.dataset.social];
        if (!url || url === "#") return;
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
    });


    /* =====================================================
       VÍDEO DE FUNDO — poupa dados quando necessário
    ===================================================== */

    const video = document.querySelector(".bg-video");

    if (video) {
        const saveData = navigator.connection && navigator.connection.saveData;

        if (saveData || reduceMotion) {
            video.removeAttribute("autoplay");
            video.pause();
        } else {
            const playing = video.play();
            if (playing && playing.catch) playing.catch(() => {});
        }
    }


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const burger = document.querySelector(".burger");
    const menu = document.getElementById("menu");

    function setMenu(open) {
        if (!burger || !menu) return;
        menu.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }

    if (burger && menu) {
        burger.addEventListener("click", () => {
            setMenu(!menu.classList.contains("is-open"));
        });

        menu.querySelectorAll("nav a").forEach((link) => {
            link.addEventListener("click", () => setMenu(false));
        });

        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target) && !burger.contains(e.target)) setMenu(false);
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") setMenu(false);
        });

        window.matchMedia("(min-width: 821px)").addEventListener("change", (e) => {
            if (e.matches) setMenu(false);
        });
    }


    /* =====================================================
       BOTÕES DE PLANO → preenchem o formulário
    ===================================================== */

    const planSelect = document.getElementById("plano");

    document.querySelectorAll("[data-plan]").forEach((button) => {
        button.addEventListener("click", () => {
            if (planSelect) planSelect.value = button.dataset.plan;
        });
    });


    /* =====================================================
       FORMULÁRIO → abre o WhatsApp com a mensagem pronta
    ===================================================== */

    const form = document.getElementById("contact-form");

    if (form) {
        const status = form.querySelector(".form-status");

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            status.classList.remove("ok");

            if (!WHATSAPP_OK) {
                status.textContent = "Falta definir o número de WhatsApp em script.js (SITE.whatsapp).";
                return;
            }

            const data = new FormData(form);

            const text = [
                "Olá! Quero uma landing page para o meu anúncio.",
                "",
                "Nome: " + String(data.get("nome")).trim(),
                "WhatsApp: " + String(data.get("whatsapp")).trim(),
                "Negócio: " + String(data.get("negocio")).trim(),
                "Plano: " + data.get("plano"),
                "Reunião: " + data.get("reuniao")
            ].join("\n");

            window.open(
                "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(text),
                "_blank",
                "noopener"
            );

            status.classList.add("ok");
            status.textContent = "Abrimos o WhatsApp com os seus dados. Basta enviar a mensagem.";
            form.reset();
        });
    }


    /* =====================================================
       ANIMAÇÕES — cabeçalho e aparecimento ao rolar
    ===================================================== */

    const siteHeader = document.querySelector(".site-header");

    if (siteHeader) {
        const onScrollHeader = () => {
            siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
        };
        onScrollHeader();
        window.addEventListener("scroll", onScrollHeader, { passive: true });
    }

    if (!reduceMotion && "IntersectionObserver" in window) {

        /* o que aparece ao rolar: seletor, atraso inicial e intervalo entre irmãos (s) */
        const REVEALS = [
            { sel: ".panel",                  base: 0,    step: 0    },
            { sel: "#planos .section-head",   base: 0,    step: 0    },
            { sel: ".plan",                   base: 0,    step: 0.14 },
            { sel: ".plans-note",              base: 0.1,  step: 0    },
            { sel: ".flow li",                base: 0.25, step: 0.12 },
            { sel: ".chips li",               base: 0.25, step: 0.08 },
            { sel: ".meeting-cards div",      base: 0.25, step: 0.12 },
            { sel: "#duvidas details",        base: 0.25, step: 0.1  },
            { sel: ".footer-inner",           base: 0,    step: 0    }
        ];

        const seen = new Set();
        const targets = [];

        REVEALS.forEach(({ sel, base, step }) => {
            document.querySelectorAll(sel).forEach((el) => {
                if (seen.has(el)) return;
                seen.add(el);

                const index = el.parentElement
                    ? Array.from(el.parentElement.children).indexOf(el)
                    : 0;

                el.classList.add("reveal");
                el.style.setProperty("--delay", (base + index * step).toFixed(2) + "s");
                targets.push(el);
            });
        });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

        document.documentElement.classList.add("js-anim");
        targets.forEach((el) => revealObserver.observe(el));
    }


    /* =====================================================
       CARROSSEL DO PORTFÓLIO — JavaScript puro
       Sempre 1 cartão ao centro + 2 de cada lado.
    ===================================================== */

    const root = document.querySelector(".carousel");
    if (!root) return;

    const track      = root.querySelector(".carousel-track");
    const slides     = Array.from(root.querySelectorAll(".carousel-slide"));
    const prevButton = root.querySelector(".carousel-prev");
    const nextButton = root.querySelector(".carousel-next");
    const pagination = root.querySelector(".carousel-pagination");
    const total      = slides.length;

    if (!total) return;

    const CONFIG = {
        startIndex: 0,          // cartão que começa ao centro (0 = primeiro)
        autoplayDelay: 5000,    // ms entre trocas automáticas
        firstSide: 0.77,        // distância do 1.º cartão lateral (× largura do cartão)
        nextSides: 0.52,        // distância extra de cada cartão seguinte
        scaleStep: 0.22,        // quanto cada posição encolhe
        minScale: 0.5,          // tamanho mínimo
        visible: 2,             // cartões visíveis de cada lado
        swipeThreshold: 50      // px para contar como arrastar
    };

    let current = Math.min(CONFIG.startIndex, total - 1);
    let timer = null;
    let hovering = false;
    let dragStartX = null;
    let justDragged = false;
    let lightboxOpen = false;
    const previousOffsets = new Array(total).fill(null);

    /* ---------- Posição relativa de cada cartão (circular) ---------- */

    function offsetOf(index) {
        let d = (((index - current) % total) + total) % total;
        if (d > total / 2) d -= total;
        return d;
    }

    /* ---------- Desenha o carrossel ---------- */

    function render() {

        slides.forEach((slide, i) => {

            const offset = offsetOf(i);
            const abs    = Math.abs(offset);
            const dir    = offset < 0 ? -1 : 1;
            const width  = slide.offsetWidth;

            const distance = abs <= 1
                ? CONFIG.firstSide * abs
                : CONFIG.firstSide + CONFIG.nextSides * (abs - 1);

            const translateX = dir * distance * width;
            const scale      = Math.max(CONFIG.minScale, 1 - CONFIG.scaleStep * abs);
            const isVisible  = abs <= CONFIG.visible;
            const transform  = "translate3d(" + translateX + "px, 0, 0) scale(" + scale + ")";

            const previous = previousOffsets[i];
            const wrapped  = previous !== null && Math.abs(offset - previous) > total / 2;

            if (wrapped) {
                /* cartão que "dá a volta": aparece do outro lado com fade,
                   em vez de atravessar o ecrã */
                slide.style.transition = "none";
                slide.style.opacity = "0";
                slide.style.transform = transform;
                void slide.offsetWidth;
                slide.style.transition = "";
            } else {
                slide.style.transform = transform;
            }

            slide.style.opacity = isVisible ? "1" : "0";
            slide.style.zIndex = String(Math.max(0, 5 - abs));
            slide.style.pointerEvents = isVisible ? "" : "none";

            slide.classList.toggle("is-active", offset === 0);
            slide.classList.toggle("is-near", abs === 1);
            slide.setAttribute("aria-hidden", offset === 0 ? "false" : "true");

            /* só o cartão central tem links acessíveis por teclado */
            slide.querySelectorAll("a").forEach((a) => {
                a.tabIndex = offset === 0 ? 0 : -1;
            });

            previousOffsets[i] = offset;
        });

        updateDots();
    }

    /* desenha sem animação (arranque e redimensionamento) */
    function renderStatic() {
        root.classList.add("is-static");
        render();
        void root.offsetWidth;
        root.classList.remove("is-static");
    }

    /* ---------- Paginação ---------- */

    const dots = slides.map((_, i) => {
        const dot = document.createElement("span");
        dot.className = "carousel-dot";
        dot.setAttribute("role", "button");
        dot.setAttribute("tabindex", "0");
        dot.setAttribute("aria-label", "Ir para o exemplo " + (i + 1));
        dot.addEventListener("click", () => goTo(i));
        dot.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goTo(i);
            }
        });
        if (pagination) pagination.appendChild(dot);
        return dot;
    });

    function updateDots() {
        dots.forEach((dot, i) => {
            const active = i === current;
            dot.classList.toggle("is-active", active);
            if (active) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
        });
    }

    /* ---------- Navegação ---------- */

    function goTo(index) {
        current = ((index % total) + total) % total;
        render();
        restartAutoplay();
    }

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    if (prevButton) prevButton.addEventListener("click", prev);
    if (nextButton) nextButton.addEventListener("click", next);

    /* clicar num cartão lateral centra-o (e não segue o link dele) */
    slides.forEach((slide, i) => {
        slide.addEventListener("click", (e) => {
            if (justDragged) {
                e.preventDefault();
                e.stopPropagation();
                justDragged = false;
                return;
            }
            if (i !== current) {
                e.preventDefault();
                e.stopPropagation();
                goTo(i);
            }
        }, true);
    });

    /* =====================================================
       MODAL — clicar na imagem do cartão central abre-a
       em ecrã inteiro (fecha com X, Esc ou clicando fora)
    ===================================================== */

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Fechar imagem"></button>' +
        '<figure class="lightbox-figure">' +
            '<img class="lightbox-img" alt="">' +
            '<figcaption class="lightbox-caption"></figcaption>' +
        '</figure>';
    document.body.appendChild(lightbox);

    const lightboxImg     = lightbox.querySelector(".lightbox-img");
    const lightboxCaption = lightbox.querySelector(".lightbox-caption");
    const lightboxClose   = lightbox.querySelector(".lightbox-close");
    let lastFocused = null;

    function openLightbox(slide) {
        const imageEl = slide.querySelector(".slide-image");
        if (!imageEl) return;

        const match = getComputedStyle(imageEl).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
        if (!match) return;

        const heading = slide.querySelector("h3");
        const title = heading ? heading.textContent.trim() : "";

        lightboxImg.src = match[1];
        lightboxImg.alt = title ? "Exemplo de landing page: " + title : "Exemplo de landing page";
        lightboxCaption.textContent = title;
        lightbox.setAttribute("aria-label", title || "Exemplo de landing page");

        lastFocused = document.activeElement;
        lightboxOpen = true;
        stopAutoplay();

        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
        lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightboxOpen) return;

        lightboxOpen = false;
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");

        if (lastFocused && lastFocused.focus) lastFocused.focus();
        startAutoplay();
    }

    slides.forEach((slide, i) => {
        slide.addEventListener("click", (e) => {
            /* cartões laterais só se centram (tratado acima);
               o cartão central abre o modal */
            if (i !== current || !slide.classList.contains("is-active")) return;
            e.preventDefault();
            openLightbox(slide);
        });
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-figure")) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (!lightboxOpen) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "Tab") {
            e.preventDefault();
            lightboxClose.focus();
        }
    });


    /* ---------- Arrastar / deslizar ---------- */

    track.addEventListener("dragstart", (e) => e.preventDefault());

    track.addEventListener("pointerdown", (e) => {
        dragStartX = e.clientX;
        justDragged = false;
    });

    window.addEventListener("pointerup", (e) => {
        if (dragStartX === null) return;

        const delta = e.clientX - dragStartX;
        dragStartX = null;

        if (Math.abs(delta) > 10) justDragged = true;

        if (delta <= -CONFIG.swipeThreshold) next();
        else if (delta >= CONFIG.swipeThreshold) prev();

        /* limpa a marca se não houve clique logo a seguir */
        setTimeout(() => { justDragged = false; }, 0);
    });

    window.addEventListener("pointercancel", () => { dragStartX = null; });

    /* ---------- Teclado ---------- */

    root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    });

    /* ---------- Autoplay ---------- */

    function stopAutoplay() {
        clearInterval(timer);
        timer = null;
    }

    function startAutoplay() {
        if (reduceMotion || hovering || lightboxOpen || document.hidden || total < 2) return;
        stopAutoplay();
        timer = setInterval(() => {
            current = (current + 1) % total;
            render();
        }, CONFIG.autoplayDelay);
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    root.addEventListener("mouseenter", () => { hovering = true; stopAutoplay(); });
    root.addEventListener("mouseleave", () => { hovering = false; startAutoplay(); });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
    });

    /* ---------- Redimensionamento ---------- */

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderStatic, 100);
    });

    /* ---------- Arranque ---------- */

    renderStatic();
    startAutoplay();
});