character.js
/**
 * Junior Astronaut Mission Trainer - Cute Animal Characters & SVG Generator
 * 6 Cute Animal Astronauts in customized astronaut suits:
 * 1. Pip the Pup (Pink Suit)
 * 2. Benny the Bunny (Lavender Suit)
 * 3. Mia the Kitty (Purple Suit)
 * 4. Oliver the Owl (Light Blue Suit)
 * 5. Barnaby the Bear (Grey Suit)
 * 6. Leo the Lion (Classic White Suit)
 */

const ASTRONAUT_CHARACTERS = [
  {
    id: 'puppy',
    name: 'Pip the Astro-Pup',
    animal: 'Golden Puppy',
    suitColorName: 'Neon Pink',
    suitColorHex: '#F472B6',
    suitTrim: '#DB2777',
    suitBody: '#FCE7F3',
    suitBackpack: '#BE185D',
    endurance: 4,
    technical: 3,
    trait: 'Brave & Energetic! Natural resilience and high stamina on missions.',
    quote: '"Woof! Ready to explore the stars!"'
  },
  {
    id: 'bunny',
    name: 'Benny the Lunar Bunny',
    animal: 'Cosmic Bunny',
    suitColorName: 'Pastel Lavender',
    suitColorHex: '#A78BFA',
    suitTrim: '#7C3AED',
    suitBody: '#EDE9FE',
    suitBackpack: '#6D28D9',
    endurance: 3,
    technical: 4,
    trait: 'Quick Reflexes! Great at fast-paced repairs and dodging hazards.',
    quote: '"Hop, skip, and jump to the Moon!"'
  },
  {
    id: 'kitty',
    name: 'Mia the Cosmic Kitty',
    animal: 'Starlight Kitten',
    suitColorName: 'Royal Purple',
    suitColorHex: '#8B5CF6',
    suitTrim: '#5B21B6',
    suitBody: '#DDD6FE',
    suitBackpack: '#4C1D95',
    endurance: 3,
    technical: 5,
    trait: 'Tech Prodigy! Master of circuits, power balance, and computer codes.',
    quote: '"Purr-fect mission telemetry incoming!"'
  },
  {
    id: 'owl',
    name: 'Oliver the Starlight Owl',
    animal: 'Wisdom Owl',
    suitColorName: 'Nebula Cyan',
    suitColorHex: '#38BDF8',
    suitTrim: '#0284C7',
    suitBody: '#E0F2FE',
    suitBackpack: '#0369A1',
    endurance: 4,
    technical: 5,
    trait: 'Space Scholar! Excels at navigation, solar alignment, and rationing.',
    quote: '"Hoo-ray for space science and discoveries!"'
  },
  {
    id: 'bear',
    name: 'Barnaby the Star Bear',
    animal: 'Panda-Bear Cub',
    suitColorName: 'Titanium Grey',
    suitColorHex: '#94A3B8',
    suitTrim: '#475569',
    suitBody: '#F1F5F9',
    suitBackpack: '#334155',
    endurance: 5,
    technical: 3,
    trait: 'Rock Solid! Maximum endurance, immune to heavy lifting fatigue.',
    quote: '"Big paws, big courage, zero gravity!"'
  },
  {
    id: 'lion',
    name: 'Leo the Solar Lion',
    animal: 'Brave Lion Cub',
    suitColorName: 'Classic White',
    suitColorHex: '#FFFFFF',
    suitTrim: '#0284C7',
    suitBody: '#F8FAFC',
    suitBackpack: '#CBD5E1',
    endurance: 4,
    technical: 4,
    trait: 'Classic Astronaut! Perfectly balanced stats, an all-around cosmic champion.',
    quote: '"Roar into the universe! Let’s make history!"'
  }
];

class CharacterRenderer {
  static getStarString(count) {
    let str = '';
    for (let i = 1; i <= 5; i++) {
      str += i <= count ? '⭐' : '☆';
    }
    return str;
  }

  static renderAvatarSVG(charId, size = 160, animated = true) {
    const char = ASTRONAUT_CHARACTERS.find(c => c.id === charId) || ASTRONAUT_CHARACTERS[0];
    const animClass = animated ? 'animated-avatar' : '';

    let headContent = '';

    if (char.id === 'puppy') {
      // Golden puppy with floppy ears and cute snout
      headContent = `
        <!-- Puppy Floppy Ears -->
        <path d="M 46 68 C 30 75 22 105 32 118 C 42 125 50 110 50 88 Z" fill="#D97706" />
        <path d="M 114 68 C 130 75 138 105 128 118 C 118 125 110 110 110 88 Z" fill="#D97706" />
        <path d="M 48 76 C 36 82 32 102 38 112 C 44 116 48 106 49 90 Z" fill="#FBBF24" />
        <path d="M 112 76 C 124 82 128 102 122 112 C 116 116 112 106 111 90 Z" fill="#FBBF24" />

        <!-- Head -->
        <circle cx="80" cy="80" r="32" fill="#FBBF24" />
        <!-- Puppy Eye Patches & Cheeks -->
        <ellipse cx="64" cy="78" rx="10" ry="12" fill="#F59E0B" opacity="0.4" />
        <circle cx="62" cy="88" r="5" fill="#F472B6" opacity="0.6" />
        <circle cx="98" cy="88" r="5" fill="#F472B6" opacity="0.6" />

        <!-- Eyes -->
        <circle cx="68" cy="78" r="4.5" fill="#1E293B" class="blink-eye" />
        <circle cx="70" cy="76" r="1.5" fill="#FFFFFF" />
        <circle cx="92" cy="78" r="4.5" fill="#1E293B" class="blink-eye" />
        <circle cx="94" cy="76" r="1.5" fill="#FFFFFF" />

        <!-- Cute Snout & Nose -->
        <ellipse cx="80" cy="86" rx="9" ry="7" fill="#FEF3C7" />
        <ellipse cx="80" cy="83" rx="3.5" ry="2.5" fill="#78350F" />
        <path d="M 77 87 Q 80 91 83 87" stroke="#78350F" stroke-width="1.8" fill="none" stroke-linecap="round" />
        <!-- Tongue -->
        <path d="M 78 89 Q 80 94 82 89" fill="#F43F5E" />
      `;
    } else if (char.id === 'bunny') {
      // White/cream bunny with long ears inside helmet
      headContent = `
        <!-- Bunny Ears -->
        <path d="M 64 62 C 54 22 66 12 72 26 C 76 38 72 58 68 64 Z" fill="#FFFFFF" />
        <path d="M 65 54 C 58 26 67 20 70 28 C 72 36 70 50 67 56 Z" fill="#F472B6" opacity="0.6" />
        <path d="M 96 62 C 106 22 94 12 88 26 C 84 38 88 58 92 64 Z" fill="#FFFFFF" />
        <path d="M 95 54 C 102 26 93 20 90 28 C 88 36 90 50 93 56 Z" fill="#F472B6" opacity="0.6" />

        <!-- Head -->
        <circle cx="80" cy="82" r="30" fill="#FFFFFF" />
        <!-- Blush -->
        <circle cx="61" cy="87" r="6" fill="#F472B6" opacity="0.5" />
        <circle cx="99" cy="87" r="6" fill="#F472B6" opacity="0.5" />

        <!-- Eyes -->
        <circle cx="68" cy="78" r="5" fill="#6B21A8" class="blink-eye" />
        <circle cx="70" cy="76" r="2" fill="#FFFFFF" />
        <circle cx="92" cy="78" r="5" fill="#6B21A8" class="blink-eye" />
        <circle cx="94" cy="76" r="2" fill="#FFFFFF" />

        <!-- Nose & Whiskers -->
        <polygon points="78,84 82,84 80,87" fill="#EC4899" />
        <path d="M 77 88 Q 80 91 83 88" stroke="#6B21A8" stroke-width="1.6" fill="none" stroke-linecap="round" />
        <path d="M 52 84 L 62 85 M 52 89 L 62 88 M 108 84 L 98 85 M 108 89 L 98 88" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" />
      `;
    } else if (char.id === 'kitty') {
      // Purple kitten with cute pointy ears
      headContent = `
        <!-- Cat Pointy Ears -->
        <polygon points="52,65 42,38 65,48" fill="#FDBA74" stroke="#FB923C" stroke-width="2" />
        <polygon points="52,62 47,44 62,51" fill="#F472B6" />
        <polygon points="108,65 118,38 95,48" fill="#FDBA74" stroke="#FB923C" stroke-width="2" />
        <polygon points="108,62 113,44 98,51" fill="#F472B6" />

        <!-- Head -->
        <circle cx="80" cy="81" r="31" fill="#FED7AA" />
        <!-- Calico spots -->
        <path d="M 55 60 Q 68 55 65 72 Q 52 75 55 60 Z" fill="#EA580C" opacity="0.8" />
        <circle cx="62" cy="87" r="5.5" fill="#F472B6" opacity="0.55" />
        <circle cx="98" cy="87" r="5.5" fill="#F472B6" opacity="0.55" />

        <!-- Big Cute Cat Eyes -->
        <ellipse cx="68" cy="77" rx="5" ry="6" fill="#047857" class="blink-eye" />
        <circle cx="69" cy="75" r="2.2" fill="#FFFFFF" />
        <circle cx="67" cy="79" r="1" fill="#FFFFFF" />

        <ellipse cx="92" cy="77" rx="5" ry="6" fill="#047857" class="blink-eye" />
        <circle cx="93" cy="75" r="2.2" fill="#FFFFFF" />
        <circle cx="91" cy="79" r="1" fill="#FFFFFF" />

        <!-- Nose, Mouth & Whiskers -->
        <polygon points="78,84 82,84 80,86.5" fill="#F43F5E" />
        <path d="M 76 87 Q 80 90 84 87" stroke="#7C2D12" stroke-width="1.6" fill="none" stroke-linecap="round" />
        <path d="M 50 83 L 60 84 M 49 88 L 60 87 M 110 83 L 100 84 M 111 88 L 100 87" stroke="#9A3412" stroke-width="1.5" stroke-linecap="round" />
      `;
    } else if (char.id === 'owl') {
      // Wise big-eyed owl with feathers
      headContent = `
        <!-- Owl Tuft Feathers -->
        <polygon points="56,58 48,36 68,46" fill="#38BDF8" />
        <polygon points="104,58 112,36 92,46" fill="#38BDF8" />

        <!-- Head -->
        <circle cx="80" cy="80" r="32" fill="#BAE6FD" />
        <!-- Eye Rings -->
        <circle cx="66" cy="77" r="14" fill="#FFFFFF" stroke="#0284C7" stroke-width="2" />
        <circle cx="94" cy="77" r="14" fill="#FFFFFF" stroke="#0284C7" stroke-width="2" />

        <!-- Big Sparkling Eyes -->
        <circle cx="66" cy="77" r="8" fill="#F59E0B" class="blink-eye" />
        <circle cx="66" cy="77" r="5" fill="#1E293B" />
        <circle cx="68" cy="75" r="2.5" fill="#FFFFFF" />

        <circle cx="94" cy="77" r="8" fill="#F59E0B" class="blink-eye" />
        <circle cx="94" cy="77" r="5" fill="#1E293B" />
        <circle cx="96" cy="75" r="2.5" fill="#FFFFFF" />

        <!-- Beak -->
        <polygon points="77,82 83,82 80,91" fill="#F97316" />
        <!-- Chest Feathers -->
        <path d="M 72 96 Q 80 102 88 96" stroke="#0284C7" stroke-width="1.8" fill="none" />
      `;
    } else if (char.id === 'bear') {
      // Panda/Bear cub with round ears
      headContent = `
        <!-- Round Bear Ears -->
        <circle cx="48" cy="54" r="13" fill="#334155" />
        <circle cx="48" cy="54" r="8" fill="#64748B" />
        <circle cx="112" cy="54" r="13" fill="#334155" />
        <circle cx="112" cy="54" r="8" fill="#64748B" />

        <!-- Head -->
        <circle cx="80" cy="82" r="32" fill="#FFFFFF" />
        <!-- Panda Eye Patches -->
        <ellipse cx="64" cy="77" rx="10" ry="11" fill="#1E293B" />
        <ellipse cx="96" cy="77" rx="10" ry="11" fill="#1E293B" />

        <!-- Eyes -->
        <circle cx="65" cy="77" r="4.5" fill="#FFFFFF" class="blink-eye" />
        <circle cx="65.5" cy="76.5" r="2.5" fill="#0EA5E9" />
        <circle cx="67" cy="75" r="1.2" fill="#FFFFFF" />

        <circle cx="95" cy="77" r="4.5" fill="#FFFFFF" class="blink-eye" />
        <circle cx="94.5" cy="76.5" r="2.5" fill="#0EA5E9" />
        <circle cx="96" cy="75" r="1.2" fill="#FFFFFF" />

        <!-- Blush & Snout -->
        <circle cx="56" cy="88" r="5" fill="#F472B6" opacity="0.6" />
        <circle cx="104" cy="88" r="5" fill="#F472B6" opacity="0.6" />
        <ellipse cx="80" cy="86" rx="9" ry="7" fill="#E2E8F0" />
        <ellipse cx="80" cy="83.5" rx="4" ry="2.8" fill="#0F172A" />
        <path d="M 77 87 Q 80 90 83 87" stroke="#0F172A" stroke-width="1.8" fill="none" stroke-linecap="round" />
      `;
    } else {
      // Classic Lion cub with golden mane
      headContent = `
        <!-- Cute Fluffy Mane -->
        <circle cx="50" cy="62" r="12" fill="#F59E0B" />
        <circle cx="44" cy="80" r="12" fill="#F59E0B" />
        <circle cx="50" cy="98" r="11" fill="#F59E0B" />
        <circle cx="110" cy="62" r="12" fill="#F59E0B" />
        <circle cx="116" cy="80" r="12" fill="#F59E0B" />
        <circle cx="110" cy="98" r="11" fill="#F59E0B" />
        <circle cx="64" cy="48" r="11" fill="#F59E0B" />
        <circle cx="96" cy="48" r="11" fill="#F59E0B" />
        <circle cx="80" cy="46" r="11" fill="#F59E0B" />

        <!-- Head -->
        <circle cx="80" cy="80" r="30" fill="#FDE047" />
        <!-- Ears -->
        <circle cx="55" cy="56" r="7" fill="#D97706" />
        <circle cx="105" cy="56" r="7" fill="#D97706" />

        <!-- Eyes -->
        <circle cx="68" cy="76" r="5" fill="#1E293B" class="blink-eye" />
        <circle cx="70" cy="74" r="2" fill="#FFFFFF" />
        <circle cx="92" cy="76" r="5" fill="#1E293B" class="blink-eye" />
        <circle cx="94" cy="74" r="2" fill="#FFFFFF" />

        <!-- Blush -->
        <circle cx="61" cy="85" r="5" fill="#F472B6" opacity="0.6" />
        <circle cx="99" cy="85" r="5" fill="#F472B6" opacity="0.6" />

        <!-- Snout & Heart Nose -->
        <ellipse cx="80" cy="84" rx="9" ry="7" fill="#FEF08A" />
        <polygon points="77,81 83,81 80,85" fill="#BE123C" />
        <path d="M 76 86 Q 80 89 84 86" stroke="#92400E" stroke-width="1.8" fill="none" stroke-linecap="round" />
      `;
    }

    return `
      <svg class="astro-svg {size}" height="${size}" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="suitGrad-${char.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${char.suitBody}" />
            <stop offset="60%" stop-color="${char.suitColorHex}" />
            <stop offset="100%" stop-color="${char.suitTrim}" />
          </linearGradient>
          <linearGradient id="visorReflect" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255, 255, 255, 0.75)" />
            <stop offset="35%" stop-color="rgba(196, 181, 253, 0.25)" />
            <stop offset="70%" stop-color="rgba(56, 189, 248, 0.05)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0.15)" />
          </linearGradient>
          <filter id="glow-${char.id}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${char.suitTrim}" flood-opacity="0.6"/>
          </filter>
        </defs>

        <!-- Oxygen Life Support Backpack -->
        <rect x="36" y="90" width="88" height="60" rx="14" fill="${char.suitBackpack}" stroke="#1E293B" stroke-width="3" />
        <ellipse cx="50" cy="90" rx="8" ry="4" fill="${char.suitTrim}" />
        <ellipse cx="110" cy="90" rx="8" ry="4" fill="${char.suitTrim}" />

        <!-- Astronaut Suit Torso -->
        <path d="M 44 110 C 44 98 116 98 116 110 L 122 155 C 122 165 38 165 38 155 Z" fill="url(#suitGrad-${char.id})" stroke="#1E293B" stroke-width="3.5" />

        <!-- Utility Belt -->
        <rect x="42" y="148" width="76" height="11" rx="4" fill="#334155" />
        <circle cx="80" cy="153.5" r="4.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.5" />

        <!-- Puffy Arms -->
        <ellipse cx="36" cy="126" rx="11" ry="19" transform="rotate(18, 36, 126)" fill="${char.suitColorHex}" stroke="#1E293B" stroke-width="3" />
        <circle cx="28" cy="144" r="8" fill="${char.suitTrim}" stroke="#1E293B" stroke-width="2.5" />

        <ellipse cx="124" cy="126" rx="11" ry="19" transform="rotate(-18, 124, 126)" fill="${char.suitColorHex}" stroke="#1E293B" stroke-width="3" />
        <circle cx="132" cy="144" r="8" fill="${char.suitTrim}" stroke="#1E293B" stroke-width="2.5" />

        <!-- Chest Control Panel & Mission Badge -->
        <rect x="58" y="115" width="44" height="24" rx="6" fill="#1E293B" stroke="#64748B" stroke-width="2" />
        <!-- Badge icon -->
        <polygon points="66,122 70,132 62,132" fill="#FDE047" />
        <!-- Gauge dials -->
        <circle cx="80" cy="127" r="4" fill="#10B981" filter="url(#glow-${char.id})" />
        <circle cx="92" cy="127" r="4" fill="#38BDF8" />
        <line x1="60" y1="135" x2="100" y2="135" stroke="#475569" stroke-width="1.5" />

        <!-- Neck Seal Ring -->
        <ellipse cx="80" cy="106" rx="36" ry="11" fill="#475569" stroke="#1E293B" stroke-width="3" />
        <ellipse cx="80" cy="104" rx="32" ry="8" fill="${char.suitTrim}" />

        <!-- Animal Head Inside -->
        <g id="animal-face">
          ${headContent}
        </g>

        <!-- Transparent Helmet Bubble -->
        <ellipse cx="80" cy="78" rx="46" ry="46" fill="url(#visorReflect)" stroke="#E2E8F0" stroke-width="3" />
        <!-- Glossy Curved Glare -->
        <path d="M 52 50 C 64 40 92 40 108 52 C 94 45 68 45 52 50 Z" fill="#FFFFFF" opacity="0.8" />
        <ellipse cx="50" cy="62" rx="4" ry="7" transform="rotate(-25, 50, 62)" fill="#FFFFFF" opacity="0.6" />
      </svg>
    `;
  }
}

window.ASTRONAUT_CHARACTERS = ASTRONAUT_CHARACTERS;
window.CharacterRenderer = CharacterRenderer;
