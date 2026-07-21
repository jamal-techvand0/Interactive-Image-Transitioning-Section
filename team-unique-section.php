<?php
/**
 * team-unique-section.php
 *
 * "What Makes the Team Unique" — interactive, click-only section.
 * Drop this in via `include` / `require` anywhere in the PHP page.
 * No build step required — make sure team-unique.css is linked in
 * <head> and team-unique.js (+ GSAP CDN) is linked before </body>.
 * See demo/index.php for the full page setup.
 */

$tuThemes = require __DIR__ . '/team-unique-data.php';
?>
<section class="tu-section" id="tu-section" data-active="" aria-labelledby="tu-heading">

  <div class="tu-header">
    <p class="tu-eyebrow">What Makes the Team Unique</p>
    <h2 id="tu-heading">Personal excellence,<br class="tu-header-break"> and deep connection to the Jerusalem ecosystem.</h2>
  </div>

  <div class="tu-stage">
    <div class="tu-ring" role="group" aria-label="Six themes — select one to expand">

      <?php foreach ($tuThemes as $i => $theme):
        $panelId = 'tu-panel-' . $theme['id'];
        $btnId   = 'tu-btn-'   . $theme['id'];
        $side    = $i % 2 === 0 ? 'left' : 'right';
      ?>
      <div class="tu-item tu-item--<?= $side ?>"
           style="--tu-accent:<?= htmlspecialchars($theme['accent']) ?>;"
           data-tu-index="<?= $i ?>">

        <!--
          .tu-card is BOTH the closed card button AND the shared-element
          source for GSAP Flip. On click, JS clones its visual state into
          the .tu-portal overlay and animates from here to there.
          aria-controls still points to the detail panel for a11y.
        -->
        <button
          type="button"
          class="tu-card"
          id="<?= $btnId ?>"
          data-theme="<?= htmlspecialchars($theme['id']) ?>"
          data-motif="<?= htmlspecialchars($theme['motif']) ?>"
          aria-expanded="false"
          aria-controls="<?= $panelId ?>"
        >
          <!-- Living color aura — blurred gradient blobs behind frosted white surface -->
          <span class="tu-card-aura tu-motif--<?= htmlspecialchars($theme['motif']) ?>" aria-hidden="true">
            <span class="tu-motif-bg"></span>
            <span class="tu-motif-glow"></span>
            <span class="tu-motif-detail"></span>
          </span>
          <!-- Frosted white overlay — lets aura glow through subtly -->
          <span class="tu-card-frosted" aria-hidden="true"></span>

          <!-- Card content (closed state) -->
          <span class="tu-card-icon" aria-hidden="true"></span>
          <span class="tu-card-body">
            <span class="tu-card-label"><?= htmlspecialchars($theme['label']) ?></span>
            <span class="tu-card-summary"><?= htmlspecialchars($theme['summary']) ?></span>
          </span>
          <span class="tu-card-chevron" aria-hidden="true"></span>
        </button>

      </div>
      <?php endforeach; ?>

      <!-- ── Central circle ── -->
      <div class="tu-core">
        <div class="tu-core-ring" aria-hidden="true"></div>
        <div class="tu-core-particles" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <svg class="tu-skyline" viewBox="0 0 200 40" aria-hidden="true" focusable="false">
          <path d="M0,40 L0,26 L10,26 L10,18 L16,10 L22,18 L22,26 L34,26 L34,14 L40,14 L40,8 L46,8 L46,14 L52,14 L52,26 L66,26 L66,20 L72,12 L78,20 L78,26 L92,26 L92,16 L98,16 L98,10 L104,10 L104,16 L110,16 L110,26 L124,26 L124,18 L130,10 L136,18 L136,26 L150,26 L150,14 L156,14 L156,8 L162,8 L162,14 L168,14 L168,26 L180,26 L180,20 L186,12 L192,20 L192,26 L200,26 L200,40 Z" />
        </svg>
        <div class="tu-core-inner">
          <!-- Default face — always visible when nothing is active -->
          <div class="tu-core-face tu-core-face--default" aria-hidden="true">
            <p class="tu-core-eyebrow">Founder / Excellence</p>
            <p class="tu-core-line">A driven, active participant</p>
            <p class="tu-core-line">contributing to Jerusalem's ecosystem,</p>
            <p class="tu-core-line">strengthening the city.</p>
          </div>
          <!-- Per-theme scene faces — only one is ever visible (JS/CSS ensure this) -->
          <?php foreach ($tuThemes as $theme): ?>
          <div
            class="tu-core-face tu-core-face--scene"
            data-core-scene="<?= htmlspecialchars($theme['id']) ?>"
            style="--tu-accent:<?= htmlspecialchars($theme['accent']) ?>;"
            aria-hidden="true"
          >
            <img
              class="tu-core-image"
              data-src="<?= htmlspecialchars($theme['image']) ?>"
              alt=""
              loading="lazy"
              decoding="async"
            >
            <p class="tu-core-scene-label"><?= htmlspecialchars($theme['label']) ?></p>
          </div>
          <?php endforeach; ?>
        </div>
        <svg class="tu-beam" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <line class="tu-beam-line tu-beam-line--left"  x1="50" y1="50" x2="0"   y2="50" />
          <line class="tu-beam-line tu-beam-line--right" x1="50" y1="50" x2="100" y2="50" />
        </svg>
      </div>

    </div><!-- /.tu-ring -->
  </div><!-- /.tu-stage -->

  <!--
    Detail panels — each stays hidden (display:none equivalent via [hidden])
    until its card is clicked. The panel is a separate, accessible region
    containing the full detail content. GSAP Flip animates the card clone
    into this space; the panel itself is not the animated element.
  -->
  <?php foreach ($tuThemes as $theme):
    $panelId = 'tu-panel-' . $theme['id'];
    $btnId   = 'tu-btn-'   . $theme['id'];
  ?>
  <div
    class="tu-panel"
    id="<?= $panelId ?>"
    role="region"
    aria-labelledby="<?= $btnId ?>"
    data-motif="<?= htmlspecialchars($theme['motif']) ?>"
    hidden
    style="--tu-accent:<?= htmlspecialchars($theme['accent']) ?>;"
  >
    <!-- Full-coverage color aura (same motif layers, now unrestrrained) -->
    <div class="tu-panel-aura tu-motif--<?= htmlspecialchars($theme['motif']) ?>" aria-hidden="true">
      <span class="tu-motif-bg"></span>
      <span class="tu-motif-glow"></span>
      <span class="tu-motif-detail"></span>
    </div>

    <!-- Frosted white overlay for the expanded panel — slightly more opaque than card -->
    <div class="tu-panel-frosted" aria-hidden="true"></div>

    <!-- Content revealed after the card settles at expanded size -->
    <div class="tu-panel-content">
      <p class="tu-panel-kicker"><?= htmlspecialchars($theme['summary']) ?></p>
      <h3 class="tu-panel-title"><?= htmlspecialchars($theme['label']) ?></h3>
      
      <!-- Highlights Grid -->
      <?php if (!empty($theme['highlights'])): ?>
      <div class="tu-panel-highlights">
        <?php foreach ($theme['highlights'] as $hl): ?>
        <div class="tu-highlight-chip">
          <span class="tu-highlight-val"><?= htmlspecialchars($hl['label']) ?></span>
          <span class="tu-highlight-cap"><?= htmlspecialchars($hl['caption']) ?></span>
        </div>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>
      
      <p class="tu-panel-detail"><?= htmlspecialchars($theme['detail']) ?></p>
      
      <!-- Interactive Tabs -->
      <?php if (!empty($theme['interactive'])): ?>
      <div class="tu-panel-interactive">
        <span class="tu-interactive-label"><?= htmlspecialchars($theme['interactive']['label']) ?></span>
        <div class="tu-interactive-tabs" role="tablist">
          <?php foreach ($theme['interactive']['tabs'] as $tIndex => $tabData): 
            $tabId = 'tu-tab-' . $theme['id'] . '-' . $tIndex;
            $panelTabId = 'tu-tabpanel-' . $theme['id'] . '-' . $tIndex;
          ?>
          <button 
            type="button" 
            role="tab" 
            class="tu-tab-btn" 
            id="<?= $tabId ?>"
            aria-selected="<?= $tIndex === 0 ? 'true' : 'false' ?>" 
            aria-controls="<?= $panelTabId ?>"
            tabindex="<?= $tIndex === 0 ? '0' : '-1' ?>"
            data-index="<?= $tIndex ?>"
          >
            <?= htmlspecialchars($tabData['tab']) ?>
          </button>
          <?php endforeach; ?>
        </div>
        <div class="tu-interactive-panels">
          <?php foreach ($theme['interactive']['tabs'] as $tIndex => $tabData): 
            $tabId = 'tu-tab-' . $theme['id'] . '-' . $tIndex;
            $panelTabId = 'tu-tabpanel-' . $theme['id'] . '-' . $tIndex;
          ?>
          <div 
            id="<?= $panelTabId ?>" 
            role="tabpanel" 
            class="tu-tab-panel <?= $tIndex === 0 ? 'is-active' : '' ?>" 
            aria-labelledby="<?= $tabId ?>"
          >
            <p><?= htmlspecialchars($tabData['text']) ?></p>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endif; ?>

      <button type="button" class="tu-panel-close" aria-label="Close panel">
        <span aria-hidden="true">&#x2715;</span>
      </button>
    </div>
  </div>
  <?php endforeach; ?>

  <!--
    Portal — the GSAP Flip target container.
    The shared-element clone lives here during the fly-to-center animation.
    Positioned absolute over the whole section, pointer-events controlled by JS.
  -->
  <div class="tu-portal" id="tu-portal" aria-hidden="true"></div>

  <!--
    ══════════════════════════════════════════════════════════════════════
    THEATER MODE — full-screen video-driven takeover.
    Opened in place of the old side-panel Flip when a card is clicked.
    Cards leave the ring and reflow into the bottom filmstrip while this
    is open; the background is a <canvas> scrubbing a numbered frame
    sequence (themes without a generated clip yet fall back to the same
    .tu-motif-- gradient used elsewhere in this file).
    ══════════════════════════════════════════════════════════════════════
  -->
  <div class="tu-theater" id="tu-theater" role="dialog" aria-modal="true" aria-label="Theme showcase" aria-hidden="true">

    <div class="tu-theater-stage">
      <canvas class="tu-theater-canvas" id="tu-theater-canvas"></canvas>
      <div class="tu-theater-poster" id="tu-theater-poster" aria-hidden="true">
        <span class="tu-motif-bg"></span>
        <span class="tu-motif-glow"></span>
        <span class="tu-motif-detail"></span>
      </div>
      <div class="tu-theater-scrim" aria-hidden="true"></div>
    </div>

    <button type="button" class="tu-theater-close" id="tu-theater-close" aria-label="Close showcase">
      <span aria-hidden="true">&#x2715;</span>
    </button>

    <div class="tu-theater-content">
      <p class="tu-theater-kicker" id="tu-theater-kicker"></p>
      <h3 class="tu-theater-title" id="tu-theater-title"></h3>
      <p class="tu-theater-detail" id="tu-theater-detail"></p>
    </div>

    <div class="tu-theater-filmstrip" role="tablist" aria-label="Choose a theme">
      <?php foreach ($tuThemes as $theme): ?>
      <button
        type="button"
        class="tu-film-btn"
        id="tu-film-<?= htmlspecialchars($theme['id']) ?>"
        data-theme="<?= htmlspecialchars($theme['id']) ?>"
        style="--tu-accent:<?= htmlspecialchars($theme['accent']) ?>;"
        role="tab"
        aria-selected="false"
      >
        <span class="tu-film-dot" aria-hidden="true"></span>
        <span class="tu-film-label"><?= htmlspecialchars($theme['label']) ?></span>
      </button>
      <?php endforeach; ?>
    </div>
  </div>

  <script>
    /* Theater-mode config, generated from team-unique-data.php so content
       edits never require touching team-unique.js. */
    window.TU_THEATER_DATA = <?= json_encode(array_map(function ($t) {
        return [
            'id'      => $t['id'],
            'motif'   => $t['motif'],
            'label'   => $t['label'],
            'summary' => $t['summary'],
            'detail'  => $t['detail'],
            'accent'  => $t['accent'],
            'frames'  => isset($t['frames']) ? $t['frames'] : null,
        ];
    }, $tuThemes), JSON_UNESCAPED_SLASHES) ?>;
  </script>

</section>