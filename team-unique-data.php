<?php
/**
 * team-unique-data.php
 *
 * Content source for the "What Makes the Team Unique" interactive section.
 * Keeping this separate from the markup means content edits (copy, order,
 * accent color, image paths) never require touching team-unique-section.php.
 *
 * Each theme needs:
 *   id          - stable slug, used in DOM ids, data-theme attributes, JS lookups
 *   motif       - which CSS ambient animation plays in the expanded panel:
 *                 water | flame | light | sunrise | stone | arches
 *   shape       - which clip-path silhouette the panel morphs into on open:
 *                 hexagon | shard | arch | blob | diamond | ribbon
 *                 Reassign freely here — no code changes needed elsewhere.
 *   label       - short heading shown on the card in its default (closed) state
 *   summary     - one-line teaser shown on the card, always visible
 *   detail      - longer paragraph(s) revealed only when the card is active
 *   accent      - CSS custom property value (hex) driving that theme's color
 *   image       - placeholder path for the themed background scene / photo
 *                 (swap for a real optimized .webp/.avif once assets exist)
 *   highlights  - array of key stats/metrics revealed in the expanded panel
 *   interactive - small tabbed block for interactive content swapping
 */

return [
    [
        'id'      => 'ecosystem',
        'motif'   => 'water',
        'shape'   => 'hexagon',
        'label'   => 'Active Connection to the Jerusalem Ecosystem',
        'summary' => 'Deep roots across the city\'s institutions and networks.',
        'detail'  => 'High-tech, healthcare, academia, arts and more — our path connects graduates to established organizations, mentors and employers, building bridges to other Jerusalem hubs along the way.',
        'accent'  => '#1C7A80',
        'image'   => 'assets/scene-ecosystem.webp',
        'highlights' => [
            ['label' => '40+', 'caption' => 'Partner organizations across the city'],
            ['label' => 'Hospitals & Labs', 'caption' => 'Direct clinical and research exposure'],
            ['label' => 'Tech Mentors', 'caption' => 'Working professionals guiding real projects'],
            ['label' => 'Cross-Team Visits', 'caption' => 'Shared site visits with other Jerusalem teams'],
        ],
        
    ],
    [
        'id'      => 'product',
        'motif'   => 'light',
        'shape'   => 'shard',
        'label'   => 'Product and Visibility',
        'summary' => 'A final showcase built for real audiences.',
        'detail'  => 'Every cohort presents a finished product to a professional or public audience — competitions, hackathons, exhibitions, and galleries held before graduation.',
        'accent'  => '#C89B5C',
        'image'   => 'assets/scene-product.webp',
        'highlights' => [
            ['label' => '1', 'caption' => 'Final showcase every single cohort'],
            ['label' => 'Public + Pro', 'caption' => 'Audiences spanning both tracks'],
            ['label' => 'Hackathons', 'caption' => 'Competitive, time-boxed builds'],
            ['label' => 'Galleries', 'caption' => 'Exhibited work, not just graded work'],
        ],
        
    ],
    [
        'id'      => 'path',
        'motif'   => 'arches',
        'shape'   => 'arch',
        'label'   => 'Developmental Path',
        'summary' => 'A multi-year track from foundation to career.',
        'detail'  => 'A structured multi-year process — from foundational training, through practical study, to an academic track and a guided personal project — that leads directly into the industry.',
        'accent'  => '#2C5C86',
        'image'   => 'assets/scene-path.webp',
        'highlights' => [
            ['label' => 'Multi-Year', 'caption' => 'One continuous track, not isolated courses'],
            ['label' => 'Foundation → Career', 'caption' => 'Structured progression at every stage'],
            ['label' => 'Academic Track', 'caption' => 'Formal study layered onto practice'],
            ['label' => 'Guided Project', 'caption' => 'A personal capstone with real mentorship'],
        ],
        
    ],
    [
        'id'      => 'strengths',
        'motif'   => 'sunrise',
        'shape'   => 'blob',
        'label'   => 'Recognized Strengths',
        'summary' => 'Every participant\'s edge, identified and sharpened.',
        'detail'  => 'We identify and develop each participant\'s unique strengths, and build a plan to help them reach personal and professional excellence.',
        'accent'  => '#14555A',
        'image'   => 'assets/scene-strengths.webp',
        'highlights' => [
            ['label' => 'Individual Plan', 'caption' => 'Built around each participant, not a fixed curriculum'],
            ['label' => 'Strength ID', 'caption' => 'Early identification of natural ability'],
            ['label' => 'Personal Excellence', 'caption' => 'Growth measured against one\'s own ceiling'],
            ['label' => 'Professional Fit', 'caption' => 'Strengths mapped to real career paths'],
        ],
        
    ],
    [
        'id'      => 'commitment',
        'motif'   => 'flame',
        'shape'   => 'diamond',
        'label'   => 'Deepened Commitment and Belonging',
        'summary' => 'Shared values, chosen and reinforced.',
        'detail'  => 'Assimilating shared values and a sense of partnership — through selection, accompaniment, and follow-through that reinforce lasting commitment to the mission.',
        'accent'  => '#3E6E4E',
        'image'   => 'assets/scene-commitment.webp',
        'highlights' => [
            ['label' => 'Shared Values', 'caption' => 'A common mission members actively choose'],
            ['label' => 'Selection', 'caption' => 'Members opt in, not assigned'],
            ['label' => 'Accompaniment', 'caption' => 'Ongoing support, not one-time onboarding'],
            ['label' => 'Follow-Through', 'caption' => 'Commitment reinforced past the first year'],
        ],
        
    ],
    [
        'id'      => 'structure',
        'motif'   => 'stone',
        'shape'   => 'ribbon',
        'label'   => 'Structure, Specializations and Roles',
        'summary' => 'A defined track and mentor for every member.',
        'detail'  => 'Every team member has a defined specialization track and a dedicated mentor who accompanies their integration into the specific demands of that track.',
        'accent'  => '#1B2A3D',
        'image'   => 'assets/scene-structure.webp',
        'highlights' => [
            ['label' => 'Defined Tracks', 'caption' => 'Every member has a named specialization'],
            ['label' => '1:1 Mentorship', 'caption' => 'A dedicated mentor per track'],
            ['label' => 'Clear Roles', 'caption' => 'Responsibilities mapped to team needs'],
            ['label' => 'Guided Integration', 'caption' => 'Support easing entry into the specific track'],
        ],
        
    ],
];
