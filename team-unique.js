/**
 * team-unique.js  v3
 *
 * "What Makes the Team Unique" interactive section.
 *
 * ══ ANIMATION TRIGGER CONTRACT ══════════════════════════════════════════════
 *
 *  ✅ CLICK / TAP only:
 *     • Opens a panel  → openCard(btn)
 *     • Closes a panel → closeCard(btn)
 *     • Switches panel → switchCard(oldBtn, newBtn)
 *     • Escape / click-outside / close button also close
 *
 *  ✅ MOUSEMOVE on closed card only (desktop with fine pointer):
 *     • 3-D tilt via inline transform         [— COSMETIC TILT —]
 *     • Aura blob shift via CSS custom props  [— COSMETIC AURA SHIFT —]
 *     NEVER opens, previews, or changes any content
 *
 *  ❌ NO scroll listeners anywhere
 *  ❌ NO hover listeners that trigger content changes
 *
 * ══ ANIMATION APPROACH — GSAP Flip (shared-element) ════════════════════════
 *
 *  OPEN sequence:
 *   1. [0ms]     Stage 1 — Liftoff: card gets .is-liftoff (scale+shadow),
 *                others dim. Core face swaps. Beam appears.
 *   2. [80ms]    Stage 2 — Flip: GSAP captures final state (portal-card at
 *                panel rect) then Flip.from() animates it from the original
 *                card rect to the panel rect (position + size together).
 *   3. [after Flip settles]  Stage 3 — Panel becomes visible (opacity 1).
 *   4. [~100ms after panel visible]  Stage 4 — Text staggers in.
 *
 *  CLOSE sequence (true reverse):
 *   1. Text fades out (panel loses .is-visible).
 *   2. After text fade: portal-card animates back from panel rect to card rect.
 *   3. After Flip completes: portal-card removed, card restored, others undim.
 *
 * ══ DEPENDENCIES ════════════════════════════════════════════════════════════
 *  GSAP 3  (https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js)
 *  Flip   (https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js)
 *  Both loaded via CDN in demo/index.php (no build step required).
 *  If GSAP is not available, the code falls back to a CSS-only approach.
 */

(function () {
  "use strict";

  /* ── Guard & refs ──────────────────────────────────────────────────────── */
  var section = document.getElementById("tu-section");
  if (!section) return;

  var buttons = Array.prototype.slice.call(
    section.querySelectorAll(".tu-card"),
  );
  var portal = document.getElementById("tu-portal");
  var core = section.querySelector(".tu-core");
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var hasGsap =
    typeof window.gsap !== "undefined" && typeof window.Flip !== "undefined";

  /* Duration constants (ms) — match CSS transition values */
  var DUR_FLIP = 580; /* GSAP Flip animation duration */
  var DUR_CONTENT = 120; /* delay before panel content shows after Flip settles */
  var DUR_CLOSE_TXT = 200; /* time to wait for text to fade before starting close Flip */

  /* State */
  var activeBtn = null;
  var portalCard =
    null; /* the clone element inside .tu-portal during animation */
  var isAnimating = false;

  /* ── Helper: find the a11y panel for a button ─────────────────────────── */
  function panelFor(btn) {
    return document.getElementById(btn.getAttribute("aria-controls"));
  }

  /* ── Helper: find the core scene face for a theme ────────────────────── */
  function sceneFor(themeId) {
    return section.querySelector(
      '.tu-core-face--scene[data-core-scene="' + themeId + '"]',
    );
  }

  /* ── Helper: compute section-relative rect of the panel's position 
      (Leaves the central core visible) ──────────────────────────────────── */
  function getPanelTargetRect(btn) {
    var sRect = section.getBoundingClientRect();
    var isMobile = sRect.width < 760;

    if (isMobile) {
      // Mobile: core is at top. Panel goes below it.
      var pw = sRect.width * 0.96;
      var pt = 260; // offset safely below the core circle
      var ph = Math.min(sRect.height - pt - 20, 800);
      if (ph < 400) ph = 400; // ensure minimum height
      return {
        left: (sRect.width - pw) / 2,
        top: pt,
        width: pw,
        height: ph,
      };
    } else {
      // Desktop: core is in center. Panel goes to opposite side.
      var item = btn ? btn.closest(".tu-item") : null;
      var side =
        item && item.classList.contains("tu-item--left") ? "left" : "right";

      var pw = Math.min(sRect.width * 0.44, 560);
      var ph = Math.min(sRect.height * 0.85, 700);
      var pt = (sRect.height - ph) / 2;

      var pl;
      if (side === "left") {
        // Card is on the left -> panel goes on the right
        pl = sRect.width - pw - Math.max(sRect.width * 0.04, 20);
      } else {
        // Card is on the right -> panel goes on the left
        pl = Math.max(sRect.width * 0.04, 20);
      }
      return {
        left: pl,
        top: pt,
        width: pw,
        height: ph,
      };
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     STAGE 1 — LIFTOFF (cosmetic — runs immediately on click)
     Card lifts, others dim, core face swaps, beam appears.
     ══════════════════════════════════════════════════════════════════════════ */
  function doLiftoff(btn) {
    var themeId = btn.getAttribute("data-theme");
    var item = btn.closest(".tu-item");
    var side = item.classList.contains("tu-item--left") ? "left" : "right";

    /* Dim all other cards */
    section.setAttribute("data-active", themeId);

    /* Mark active item */
    item.classList.add("is-active");
    btn.setAttribute("aria-expanded", "true");

    /* Core: swap face */
    var scene = sceneFor(themeId);
    if (scene) scene.classList.add("is-active");

    /* Core: update beam direction */
    if (core) {
      core.classList.remove("tu-beam--left", "tu-beam--right");
      core.classList.add("tu-beam--" + side);
    }
  }

  /* Reverse liftoff (called at the end of close sequence) */
  function undoLiftoff(btn) {
    var themeId = btn.getAttribute("data-theme");
    var item = btn.closest(".tu-item");

    section.setAttribute("data-active", "");
    item.classList.remove("is-active");
    btn.setAttribute("aria-expanded", "false");

    var scene = sceneFor(themeId);
    if (scene) scene.classList.remove("is-active");

    if (core) core.classList.remove("tu-beam--left", "tu-beam--right");
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GSAP FLIP APPROACH — OPEN
     Positions a clone card in the portal, then Flip.from() animates it
     from the original card's rect to the panel's positioned rect.
     ══════════════════════════════════════════════════════════════════════════ */
  function openWithFlip(btn, panel) {
    /* [GSAP FLIP — card fly-to-center] */
    var sRect = section.getBoundingClientRect();
    var cardRect = btn.getBoundingClientRect();
    var motif = btn.getAttribute("data-motif");
    var targetRect = getPanelTargetRect(btn);

    /* Apply target rect to the real accessible panel */
    panel.style.left = targetRect.left + "px";
    panel.style.top = targetRect.top + "px";
    panel.style.width = targetRect.width + "px";
    panel.style.height = targetRect.height + "px";
    panel.style.transform =
      "none"; /* override CSS translate(-50%,-50%) if any */

    /* Create the portal clone that GSAP will animate */
    portalCard = document.createElement("div");
    portalCard.className = "tu-portal-card";
    /* Set it to final position first — Flip.from() will pull it back to card */
    portalCard.style.left = targetRect.left + "px";
    portalCard.style.top = targetRect.top + "px";
    portalCard.style.width = targetRect.width + "px";
    portalCard.style.height = targetRect.height + "px";

    /* Add the same aura layers so the background appears in the flying card */
    var auraClone = document.createElement("div");
    auraClone.className = "tu-panel-aura tu-motif--" + motif;
    auraClone.innerHTML =
      '<span class="tu-motif-bg"></span><span class="tu-motif-glow"></span><span class="tu-motif-detail"></span>';

    var frostedClone = document.createElement("div");
    frostedClone.className = "tu-panel-frosted";

    portalCard.appendChild(auraClone);
    portalCard.appendChild(frostedClone);
    portal.appendChild(portalCard);

    /* Hide the original card visually (it stays in DOM for a11y + layout) */
    btn.style.visibility = "hidden";

    /* State of portalCard at the final destination */
    var flipState = Flip.getState(portalCard);

    /* Override portal card to match the original card rect (Flip's "from" state) */
    var cardRelLeft = cardRect.left - sRect.left;
    var cardRelTop = cardRect.top - sRect.top;
    gsap.set(portalCard, {
      x: cardRelLeft - targetRect.left,
      y: cardRelTop - targetRect.top,
      width: cardRect.width,
      height: cardRect.height,
      borderRadius: getComputedStyle(btn).borderRadius,
    });

    /* [GSAP FLIP — shared-element: position + size animate together] */
    Flip.from(flipState, {
      duration: DUR_FLIP / 1000,
      ease: "power3.inOut",
      onComplete: function () {
        /* Stage 3 — reveal the real panel (now that the clone has settled) */
        panel.hidden = false;
        /* Give DOM one frame to paint, then fade in */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            panel.classList.add("is-visible");
            /* Stage 4 — text staggers in (CSS handles the stagger delays) */
          });
        });

        /* Hide the portal card now that the real panel takes over */
        if (portalCard.parentNode)
          portalCard.parentNode.removeChild(portalCard);
        portalCard = null;
        isAnimating = false;
      },
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     GSAP FLIP APPROACH — CLOSE
     Reverse: text fades, portal clone re-appears at panel rect,
     Flip animates it back to card rect, then everything restores.
     ══════════════════════════════════════════════════════════════════════════ */
  function closeWithFlip(btn, panel) {
    var sRect = section.getBoundingClientRect();
    var cardRect = btn.getBoundingClientRect();
    var motif =
      btn.getAttribute("data-motif") || panel.getAttribute("data-motif");
    var targetRect = getPanelTargetRect(btn);

    /* Step 1 — fade out text content */
    panel.classList.remove("is-visible");

    /* Step 2 — after text fades, create closing clone and animate back */
    window.setTimeout(function () {
      /* Create a fresh close-clone at the panel's position */
      var closeClone = document.createElement("div");
      closeClone.className = "tu-portal-card";
      closeClone.style.left = targetRect.left + "px";
      closeClone.style.top = targetRect.top + "px";
      closeClone.style.width = targetRect.width + "px";
      closeClone.style.height = targetRect.height + "px";

      var auraClone = document.createElement("div");
      auraClone.className = "tu-panel-aura tu-motif--" + motif;
      auraClone.innerHTML =
        '<span class="tu-motif-bg"></span><span class="tu-motif-glow"></span><span class="tu-motif-detail"></span>';

      var frostedClone = document.createElement("div");
      frostedClone.className = "tu-panel-frosted";

      closeClone.appendChild(auraClone);
      closeClone.appendChild(frostedClone);
      portal.appendChild(closeClone);

      /* Hide the real panel (so clone takes its place during animation) */
      panel.hidden = true;

      /* [GSAP FLIP — shared-element close: same card rect as target "from"] */
      var cardRelLeft = cardRect.left - sRect.left;
      var cardRelTop = cardRect.top - sRect.top;

      var flipState = Flip.getState(closeClone);

      gsap.set(closeClone, {
        x: cardRelLeft - targetRect.left,
        y: cardRelTop - targetRect.top,
        width: cardRect.width,
        height: cardRect.height,
        borderRadius: getComputedStyle(btn).borderRadius,
      });

      Flip.from(flipState, {
        duration: DUR_FLIP / 1000,
        ease: "power3.inOut",
        onComplete: function () {
          /* [Stage 4 close] — all other cards un-dim, active card restores */
          undoLiftoff(btn);
          /* Restore card visibility */
          btn.style.visibility = "";
          /* Remove portal clone */
          if (closeClone.parentNode)
            closeClone.parentNode.removeChild(closeClone);
          /* Remove any leftover open portal cards */
          while (portal.firstChild) portal.removeChild(portal.firstChild);
          portalCard = null;
          section.classList.remove("has-open-panel");
          isAnimating = false;
        },
      });
    }, DUR_CLOSE_TXT);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     CSS FALLBACK (when GSAP is not available)
     Simple opacity fade — same a11y, no shared-element animation.
     ══════════════════════════════════════════════════════════════════════════ */
  function openWithCSS(btn, panel) {
    var targetRect = getPanelTargetRect(btn);
    panel.style.left = targetRect.left + "px";
    panel.style.top = targetRect.top + "px";
    panel.style.width = targetRect.width + "px";
    panel.style.height = targetRect.height + "px";
    panel.style.transform = "none";

    panel.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        panel.classList.add("is-visible");
        isAnimating = false;
      });
    });
  }

  function closeWithCSS(btn, panel) {
    panel.classList.remove("is-visible");
    window.setTimeout(function () {
      panel.hidden = true;
      undoLiftoff(btn);
      section.classList.remove("has-open-panel");
      isAnimating = false;
    }, 320);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     CROSS-FADE CARD SWITCHING
     When one panel is open and another card is clicked, smoothly cross-fade
     between the panels without collapsing back to the small card state.
     ══════════════════════════════════════════════════════════════════════════ */
  function switchCard(oldBtn, newBtn) {
    if (isAnimating) return;
    isAnimating = true;

    var oldPanel = panelFor(oldBtn);
    var newPanel = panelFor(newBtn);
    activeBtn = newBtn;

    /* Stage 1 - Immediate swap of outer context */
    undoLiftoff(oldBtn);
    oldBtn.style.visibility = "";
    doLiftoff(newBtn);
    newBtn.style.visibility = "hidden";

    /* Update new panel position before revealing */
    var targetRect = getPanelTargetRect(newBtn);
    if (newPanel) {
      newPanel.style.left = targetRect.left + "px";
      newPanel.style.top = targetRect.top + "px";
      newPanel.style.width = targetRect.width + "px";
      newPanel.style.height = targetRect.height + "px";
      newPanel.style.transform = "none";
    }

    if (reduceMotion) {
      if (oldPanel) {
        oldPanel.classList.remove("is-visible");
        oldPanel.hidden = true;
      }
      if (newPanel) {
        newPanel.hidden = false;
        newPanel.classList.add("is-visible");
      }
      isAnimating = false;
      return;
    }

    if (!oldPanel || !newPanel) {
      isAnimating = false;
      return;
    }

    /* Ensure new panel content starts in hidden state for animation */
    newPanel.classList.remove("is-visible");
    newPanel.hidden = false;
    newPanel.classList.add("is-transitioning-in");

    /* Force a synchronous reflow so the browser registers the initial
       (opacity:0 / translateY) state before we add .is-visible */
    void newPanel.offsetHeight;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        /* CSS cross-fade: fade out old panel text, stagger in new panel */
        oldPanel.classList.remove("is-visible");
        newPanel.classList.add("is-visible");

        window.setTimeout(function () {
          oldPanel.hidden = true;
          newPanel.classList.remove("is-transitioning-in");
          /* Clean up any abandoned portal cards just in case */
          while (portal.firstChild) portal.removeChild(portal.firstChild);
          isAnimating = false;
        }, 360); /* CSS visibility transition duration is 260ms */
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PUBLIC OPEN / CLOSE
     ══════════════════════════════════════════════════════════════════════════ */
  function openCard(btn) {
    if (isAnimating) return;
    isAnimating = true;

    var panel = panelFor(btn);
    activeBtn = btn;

    /* Stage 1 — liftoff (immediate) */
    doLiftoff(btn);
    section.classList.add("has-open-panel");

    if (reduceMotion) {
      /* Instant open: skip all animations */
      if (panel) {
        var targetRect = getPanelTargetRect(btn);
        panel.style.left = targetRect.left + "px";
        panel.style.top = targetRect.top + "px";
        panel.style.width = targetRect.width + "px";
        panel.style.height = targetRect.height + "px";
        panel.style.transform = "none";
        panel.hidden = false;
        panel.classList.add("is-visible");
      }
      isAnimating = false;
      return;
    }

    if (!panel) {
      isAnimating = false;
      return;
    }

    /* Stage 2 + 3 + 4 */
    if (hasGsap) {
      openWithFlip(btn, panel);
    } else {
      openWithCSS(btn, panel);
    }
  }

  function closeCard(btn) {
    if (!btn) return;
    if (isAnimating && !section.classList.contains("has-open-panel")) return;
    isAnimating = true;

    var panel = panelFor(btn);
    activeBtn = null;

    if (reduceMotion) {
      if (panel) {
        panel.classList.remove("is-visible");
        panel.hidden = true;
      }
      undoLiftoff(btn);
      btn.style.visibility = "";
      while (portal && portal.firstChild) portal.removeChild(portal.firstChild);
      section.classList.remove("has-open-panel");
      isAnimating = false;
      return;
    }

    if (!panel) {
      undoLiftoff(btn);
      isAnimating = false;
      return;
    }

    if (hasGsap) {
      closeWithFlip(btn, panel);
    } else {
      closeWithCSS(btn, panel);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     CLICK HANDLING
     ══════════════════════════════════════════════════════════════════════════ */
  buttons.forEach(function (btn, index) {
    /* ── Card click / tap ─────────────────────────────────────────────────── */
    btn.addEventListener("click", function () {
      var themeId = btn.getAttribute("data-theme");
      if (theater.isOpen && theater.activeId === themeId) {
        theater.close(btn);
      } else {
        theater.open(themeId, btn);
      }
    });

    /* ── Keyboard navigation ──────────────────────────────────────────────── */
    btn.addEventListener("keydown", function (e) {
      var nextIndex = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIndex = (index + 1) % buttons.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIndex = (index - 1 + buttons.length) % buttons.length;
      } else if (e.key === "Escape") {
        if (btn.getAttribute("aria-expanded") === "true") {
          closeCard(btn);
          btn.focus();
        }
        return;
      }
      if (nextIndex !== null) {
        e.preventDefault();
        buttons[nextIndex].focus();
      }
    });
  });

  /* ── Close button inside panel ────────────────────────────────────────── */
  section.addEventListener("click", function (e) {
    var closeBtnEl = e.target.closest(".tu-panel-close");
    if (closeBtnEl) {
      var panelEl = closeBtnEl.closest(".tu-panel");
      if (panelEl) {
        var panelId = panelEl.id;
        var ownerBtn = section.querySelector(
          '[aria-controls="' + panelId + '"]',
        );
        if (ownerBtn) {
          closeCard(ownerBtn);
          /* Return focus to the card after close animation */
          window.setTimeout(function () {
            ownerBtn.focus();
          }, DUR_FLIP + 100);
        }
      }
      return;
    }

    /* ── Click outside (on portal overlay background, not the clone card) ── */
    if (
      e.target === portal ||
      e.target.classList.contains("tu-panel-frosted")
    ) {
      if (activeBtn) closeCard(activeBtn);
    }
  });

  /* ── Escape key from anywhere in the section ──────────────────────────── */
  section.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeBtn) {
      var saved = activeBtn;
      closeCard(saved);
      window.setTimeout(function () {
        saved.focus();
      }, DUR_FLIP + 100);
    }
  });

  /* ══════════════════════════════════════════════════════════════════════════
     INTERACTIVE TABS
     ══════════════════════════════════════════════════════════════════════════ */
  var tabButtons = Array.prototype.slice.call(
    section.querySelectorAll(".tu-tab-btn"),
  );
  tabButtons.forEach(function (tabBtn) {
    tabBtn.addEventListener("click", function () {
      var panelTabId = tabBtn.getAttribute("aria-controls");
      var panelGroup = tabBtn.closest(".tu-panel-interactive");
      if (!panelGroup) return;

      var allTabs = Array.prototype.slice.call(
        panelGroup.querySelectorAll(".tu-tab-btn"),
      );
      var allPanels = Array.prototype.slice.call(
        panelGroup.querySelectorAll(".tu-tab-panel"),
      );

      /* Deactivate all */
      allTabs.forEach(function (btn) {
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute("tabindex", "-1");
      });
      allPanels.forEach(function (pnl) {
        pnl.classList.remove("is-active");
      });

      /* Activate clicked */
      tabBtn.setAttribute("aria-selected", "true");
      tabBtn.setAttribute("tabindex", "0");
      var activePanel = document.getElementById(panelTabId);
      if (activePanel) {
        activePanel.classList.add("is-active");
      }
    });

    /* Keyboard nav for tabs (Arrow Left/Right) */
    tabBtn.addEventListener("keydown", function (e) {
      var allTabs = Array.prototype.slice.call(
        tabBtn.closest(".tu-interactive-tabs").querySelectorAll(".tu-tab-btn"),
      );
      var index = allTabs.indexOf(tabBtn);
      var nextIndex = null;
      if (e.key === "ArrowRight") {
        nextIndex = (index + 1) % allTabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (index - 1 + allTabs.length) % allTabs.length;
      }
      if (nextIndex !== null) {
        e.preventDefault();
        allTabs[nextIndex].focus();
        allTabs[nextIndex].click();
      }
    });
  });

  /* ══════════════════════════════════════════════════════════════════════════
     HOVER TILT + AURA SHIFT — CLOSED CARDS ONLY
     [— COSMETIC TILT —] [— COSMETIC AURA SHIFT —]
     Purely visual. Never opens or changes content.
     Disabled on touch/coarse-pointer devices (no cursor to track).
     ══════════════════════════════════════════════════════════════════════════ */
  var TILT_MAX_DEG = 7; /* max tilt angle in degrees */
  var isMouseDevice = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  if (isMouseDevice && !reduceMotion) {
    buttons.forEach(function (btn) {
      /* [— COSMETIC TILT —] mousemove handler */
      btn.addEventListener("mousemove", function (e) {
        /* Never tilt an open card */
        if (btn.getAttribute("aria-expanded") === "true") return;
        if (isAnimating) return;

        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2); /* -1 … 1 */
        var dy = (e.clientY - cy) / (rect.height / 2); /* -1 … 1 */

        /* rotateX tilts around horizontal axis, rotateY around vertical */
        var rx = -dy * TILT_MAX_DEG;
        var ry = dx * TILT_MAX_DEG;

        btn.style.transform = [
          "perspective(700px)",
          "rotateX(" + rx.toFixed(2) + "deg)",
          "rotateY(" + ry.toFixed(2) + "deg)",
          "scale(1.02)",
          "translateZ(6px)",
        ].join(" ");

        /* [— COSMETIC AURA SHIFT —]
           Move the aura blob gradient origin toward the cursor.
           We write CSS custom props on the aura element so we can
           reference them in a ::before/::after pseudo-element if needed.
           For now we shift the aura div's transform slightly toward cursor. */
        var aura = btn.querySelector(".tu-card-aura");
        if (aura) {
          var shiftX = dx * 14; /* px shift toward cursor */
          var shiftY = dy * 10;
          aura.style.transform =
            "translate(" + shiftX + "px, " + shiftY + "px)";
        }
      });

      /* Reset on leave */
      btn.addEventListener("mouseleave", function () {
        if (btn.getAttribute("aria-expanded") === "true") return;
        btn.style.transform = "";
        var aura = btn.querySelector(".tu-card-aura");
        if (aura) aura.style.transform = "";
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     LAZY-LOAD CORE SCENE IMAGES (on click, never on scroll/hover)
     ══════════════════════════════════════════════════════════════════════════ */
  var loadedImages = {};
  section.addEventListener("click", function (e) {
    var btn = e.target.closest(".tu-card");
    if (!btn) return;
    var themeId = btn.getAttribute("data-theme");
    if (loadedImages[themeId]) return;
    var scene = sceneFor(themeId);
    var img = scene && scene.querySelector(".tu-core-image");
    if (img && img.dataset.src) {
      img.src = img.dataset.src;
      loadedImages[themeId] = true;
    }
  });

  /* ══════════════════════════════════════════════════════════════════════════
     THEATER MODE
     Full-screen video-driven takeover, opened in place of the old side panel.

     Hub-and-spoke video model:
       • Every theme with a `frames` sequence goes Hub (frame 0) -> Theme
         (last frame). There is no theme-to-theme clip.
       • Jumping between two "has video" themes is done in two fixed-duration
         legs: retreat (play the currently-open clip backward to frame 0),
         then advance (play the target clip forward from frame 0). Total time
         is always the same regardless of which two themes are involved.
       • Themes without a `frames` sequence yet fall back to a crossfade of
         the existing .tu-motif-- gradient (same visual language as the
         cards / old panel), so the UI is fully functional today and any
         theme "lights up" with real video the moment its clip + frames are
         added to team-unique-data.php — no JS changes needed.
     ══════════════════════════════════════════════════════════════════════════ */
  var theater = (function () {
    var THEMES = window.TU_THEATER_DATA || [];
    var byId = {};
    THEMES.forEach(function (t) {
      byId[t.id] = t;
    });

    var CLIP_DUR = 1600; /* ms — linked-pair scrub duration (real "video" playback) */
    var LEG_DUR = 420;
    var FADE_DUR = 420;

    function restIndexFor(theme) {
      if (theme.frames && theme.frames.restIndex != null)
        return theme.frames.restIndex;
      return theme.frames ? theme.frames.count - 1 : 0;
    }

    function sameClip(a, b) {
      return a.frames && b.frames && a.frames.dir === b.frames.dir;
    }

    var root = document.getElementById("tu-theater");
    var canvas = document.getElementById("tu-theater-canvas");
    var poster = document.getElementById("tu-theater-poster");
    var closeBtn = document.getElementById("tu-theater-close");
    var kickerEl = document.getElementById("tu-theater-kicker");
    var titleEl = document.getElementById("tu-theater-title");
    var detailEl = document.getElementById("tu-theater-detail");
    var filmBtns = root
      ? Array.prototype.slice.call(root.querySelectorAll(".tu-film-btn"))
      : [];
    var ctx = canvas ? canvas.getContext("2d") : null;

    if (!root || !ctx) {
      /* Markup missing (e.g. included on a page without theater support) —
         degrade to a no-op so ring clicks don't throw. */
      return {
        isOpen: false,
        activeId: null,
        open: function () {},
        close: function () {},
      };
    }

    var state = {
      isOpen: false,
      activeId: null /* theme currently shown */,
      lastFrameIdx: {} /* per-theme: which frame index it's parked on */,
    };

    var frameCache = {}; /* frames.dir -> array of Image objects */
    var activeTransitionId = 0;
    var lastLaunchBtn = null;

    /* ── Frame preloading ─────────────────────────────────────────────── */
    function frameUrl(cfg, i) {
      var n = String(i + 1);
      while (n.length < cfg.pad) n = "0" + n;
      return cfg.dir + cfg.prefix + n + "." + cfg.ext;
    }

    function ensureFrames(themeId) {
      var theme = byId[themeId];
      if (!theme || !theme.frames) return null;
      var cfg = theme.frames;
      if (frameCache[cfg.dir]) return frameCache[cfg.dir];
      var arr = [];
      for (var i = 0; i < cfg.count; i++) {
        var img = new Image();
        img.src = frameUrl(cfg, i);
        arr.push(img);
      }
      frameCache[cfg.dir] = arr;
      return arr;
    }

    /* Warm the cache for any theme that already has frames, low priority,
       so the first click doesn't stall on network. */
    window.setTimeout(function () {
      THEMES.forEach(function (t) {
        if (t.frames) ensureFrames(t.id);
      });
    }, 400);

    /* ── Canvas sizing / drawing ──────────────────────────────────────── */
    function sizeCanvas() {
      var dpr = window.devicePixelRatio || 1;
      var w = root.clientWidth,
        h = root.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", function () {
      if (state.isOpen) {
        sizeCanvas();
        redrawCurrent();
      }
    });

    var lastDrawnImg = null;
    function drawFrame(img) {
      if (!img) return;
      lastDrawnImg = img;
      var cw = root.clientWidth,
        ch = root.clientHeight;
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;
      if (!iw || !ih) return; /* not decoded yet */
      var scale = Math.max(cw / iw, ch / ih);
      var dw = iw * scale,
        dh = ih * scale;
      var dx = (cw - dw) / 2,
        dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }
    function redrawCurrent() {
      if (lastDrawnImg) drawFrame(lastDrawnImg);
    }

    /* ── Frame tween (from the handoff doc's sketch) ──────────────────── */
    function tween(frames, startIdx, endIdx, duration, transitionId, onDone) {
      var t0 = performance.now();
      function step(now) {
        if (transitionId !== activeTransitionId)
          return; /* cancelled by a newer click */
        var p = Math.min((now - t0) / duration, 1);
        var idx = Math.round(startIdx + (endIdx - startIdx) * p);
        drawFrame(frames[Math.max(0, Math.min(frames.length - 1, idx))]);
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          onDone();
        }
      }
      requestAnimationFrame(step);
    }

    /* ── Poster (motif gradient) fallback ─────────────────────────────── */
    var currentMotifClass = null;
    function setPoster(motif, visible) {
      if (motif && motif !== currentMotifClass) {
        if (currentMotifClass)
          poster.classList.remove("tu-motif--" + currentMotifClass);
        poster.classList.add("tu-motif--" + motif);
        currentMotifClass = motif;
      }
      poster.classList.toggle("is-visible", !!visible);
    }

    /* ── Text content ──────────────────────────────────────────────────── */
    function setContent(theme) {
      kickerEl.textContent = theme.summary;
      titleEl.textContent = theme.label;
      detailEl.textContent = theme.detail;
    }

    /* ── Filmstrip active state ──────────────────────────────────────── */
    function setActiveFilm(themeId) {
      filmBtns.forEach(function (b) {
        b.setAttribute(
          "aria-selected",
          b.getAttribute("data-theme") === themeId ? "true" : "false",
        );
      });
    }

    /* ── Ring buttons: keep aria-expanded in sync while theater is open ── */
    function setRingExpanded(themeId, expanded) {
      buttons.forEach(function (b) {
        if (b.getAttribute("data-theme") === themeId) {
          b.setAttribute("aria-expanded", expanded ? "true" : "false");
        }
      });
    }

    /* ── Core transition: go from whatever is showing to `targetId` ────── */
    function goTo(targetId, myTransitionId) {
      var target = byId[targetId];
      if (!target) return;
      var fromId = state.activeId;
      var fromTheme = fromId ? byId[fromId] : null;

      setContent(target);
      setActiveFilm(targetId);
      root.classList.remove("is-content-visible");
      window.setTimeout(function () {
        if (myTransitionId === activeTransitionId)
          root.classList.add("is-content-visible");
      }, 60);

      var targetFrames = target.frames ? ensureFrames(targetId) : null;
      var fromFrames =
        fromTheme && fromTheme.frames ? ensureFrames(fromId) : null;

      /* ─── Branch A: going from one frame-theme to another in the same
             clip directory (linked pair, e.g. ecosystem <-> product) ─── */
      if (fromFrames && targetFrames && sameClip(fromTheme, target)) {
        var startIdx =
          state.lastFrameIdx[fromId] != null
            ? state.lastFrameIdx[fromId]
            : restIndexFor(fromTheme);
        canvas.classList.add("is-visible");
        setPoster(null, false);
        drawFrame(fromFrames[startIdx]);
        tween(
          fromFrames,
          startIdx,
          restIndexFor(target),
          CLIP_DUR,
          myTransitionId,
          function () {
            state.lastFrameIdx[targetId] = restIndexFor(target);
            state.activeId = targetId;
          },
        );
        return;
      }

      /* ─── Branch B: settling an unrelated frame-theme, or leaving
             a poster theme, or first open ─── */

      /* If we are currently showing a frame theme that is NOT in the same
         clip as the target, first settle it to its own restIndex. */
      if (fromFrames && (!targetFrames || !sameClip(fromTheme, target))) {
        var settleIdx =
          state.lastFrameIdx[fromId] != null
            ? state.lastFrameIdx[fromId]
            : restIndexFor(fromTheme);
        var targetRest = restIndexFor(fromTheme);
        if (settleIdx !== targetRest) {
          tween(
            fromFrames,
            settleIdx,
            targetRest,
            LEG_DUR,
            myTransitionId,
            function () {
              if (myTransitionId !== activeTransitionId) return;
              state.lastFrameIdx[fromId] = targetRest;
              arriveAt(target, targetFrames, myTransitionId);
            },
          );
          return;
        } else {
          /* Already at rest — just proceed */
        }
      }

      arriveAt(target, targetFrames, myTransitionId);
    }

    function arriveAt(target, targetFrames, myTransitionId) {
      if (targetFrames) {
        canvas.classList.add("is-visible");
        setPoster(null, false);
        var restIdx = restIndexFor(target);
        drawFrame(targetFrames[restIdx]);
        state.lastFrameIdx[target.id] = restIdx;
      } else {
        canvas.classList.remove("is-visible");
        setPoster(target.motif, true);
      }
      state.activeId = target.id;
    }

    function open(themeId, launchBtn) {
      var myTransitionId = ++activeTransitionId;
      lastLaunchBtn = launchBtn || lastLaunchBtn;

      if (!state.isOpen) {
        state.isOpen = true;
        root.setAttribute("aria-hidden", "false");
        sizeCanvas();
        requestAnimationFrame(function () {
          root.classList.add("is-open");
        });
        document.addEventListener("keydown", onKeydown);
      }

      if (launchBtn) setRingExpanded(themeId, true);
      goTo(themeId, myTransitionId);
    }

    function close() {
      if (!state.isOpen) return;
      var myTransitionId = ++activeTransitionId;
      var fromId = state.activeId;
      var fromTheme = fromId ? byId[fromId] : null;
      var fromFrames =
        fromTheme && fromTheme.frames ? ensureFrames(fromId) : null;

      root.classList.remove("is-content-visible");
      if (fromId) setRingExpanded(fromId, false);

      function finish() {
        state.isOpen = false;
        state.activeId = null;
        root.classList.remove("is-open");
        canvas.classList.remove("is-visible");
        setPoster(null, false);
        window.setTimeout(function () {
          root.setAttribute("aria-hidden", "true");
        }, 460 /* matches --tu-dur */);
        document.removeEventListener("keydown", onKeydown);
        if (lastLaunchBtn) lastLaunchBtn.focus();
      }

      if (reduceMotion) {
        finish();
        return;
      }

      if (fromFrames) {
        var fromIdx =
          state.lastFrameIdx[fromId] != null
            ? state.lastFrameIdx[fromId]
            : restIndexFor(fromTheme);
        tween(fromFrames, fromIdx, 0, LEG_DUR, myTransitionId, function () {
          if (myTransitionId === activeTransitionId) finish();
        });
      } else {
        setPoster(fromTheme ? fromTheme.motif : null, false);
        window.setTimeout(function () {
          if (myTransitionId === activeTransitionId) finish();
        }, FADE_DUR);
      }
    }

    function onKeydown(e) {
      if (e.key === "Escape") close();
    }

    /* ── Filmstrip clicks ──────────────────────────────────────────────── */
    filmBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var themeId = b.getAttribute("data-theme");
        if (themeId === state.activeId) return;
        open(themeId, null);
      });
    });

    closeBtn.addEventListener("click", close);

    /* Click on the scrim/stage background (not the filmstrip/content/close
       button) also closes, matching the old panel's click-outside behavior. */
    root.addEventListener("click", function (e) {
      if (
        e.target === root ||
        e.target === canvas ||
        e.target.classList.contains("tu-theater-scrim")
      ) {
        close();
      }
    });

    if (reduceMotion) {
      /* Reduced motion: skip all tweening, snap straight to target frame/poster. */
      var realGoTo = goTo;
      goTo = function (targetId, myTransitionId) {
        var target = byId[targetId];
        if (!target) return;
        setContent(target);
        setActiveFilm(targetId);
        root.classList.add("is-content-visible");
        var frames = target.frames ? ensureFrames(targetId) : null;
        if (frames) {
          canvas.classList.add("is-visible");
          setPoster(null, false);
          var restIdx = restIndexFor(target);
          drawFrame(frames[restIdx]);
          state.lastFrameIdx[targetId] = restIdx;
        } else {
          canvas.classList.remove("is-visible");
          setPoster(target.motif, true);
        }
        state.activeId = targetId;
      };
    }

    return {
      open: open,
      close: close,
      get isOpen() {
        return state.isOpen;
      },
      get activeId() {
        return state.activeId;
      },
    };
  })();
})();
