gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════
//  BACKGROUND MUSIC (local MP3)
// ═══════════════════════════════════════
let isMusicOn = true;
const bgMusic = document.getElementById('bg-music');
bgMusic.volume = 0.4;

// Auto-play on first user interaction (click, scroll, or keypress)
function startMusic() {
    if (isMusicOn) bgMusic.play();
    ['click', 'scroll', 'keydown', 'touchstart'].forEach(e =>
        document.removeEventListener(e, startMusic));
}
['click', 'scroll', 'keydown', 'touchstart'].forEach(e =>
    document.addEventListener(e, startMusic, { once: true }));

// Music toggle button
const musicBtn = document.getElementById('music-toggle');
const onIcon = document.getElementById('music-on-icon');
const offIcon = document.getElementById('music-off-icon');

musicBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent startMusic from re-triggering
    if (isMusicOn) {
        bgMusic.pause();
        onIcon.style.display = 'none';
        offIcon.style.display = 'block';
    } else {
        bgMusic.play();
        onIcon.style.display = 'block';
        offIcon.style.display = 'none';
    }
    isMusicOn = !isMusicOn;
});

window.addEventListener('load', () => {

    // ═══════════════════════════════════════
    //  PHASE 0: INTRO — Batman runs in from left
    // ═══════════════════════════════════════

    // Reusable walk cycle function
    function createWalkCycle(timeline, duration, startPos) {
        const stepTime = 0.18;
        const numSteps = Math.ceil(duration / stepTime);

        // --- LEGS: opposite motion, thigh swings from hip ---
        // Left leg swings forward
        timeline.to("#bat-leg-left", {
            rotation: 30, yoyo: true, repeat: numSteps,
            duration: stepTime, ease: "sine.inOut"
        }, startPos);
        // Right leg swings backward (opposite)
        timeline.to("#bat-leg-right", {
            rotation: -30, yoyo: true, repeat: numSteps,
            duration: stepTime, ease: "sine.inOut"
        }, startPos);

        // --- KNEES: shin bends when leg swings back ---
        timeline.to("#bat-shin-left", {
            rotation: 40, yoyo: true, repeat: numSteps,
            duration: stepTime, ease: "sine.inOut"
        }, startPos);
        timeline.to("#bat-shin-right", {
            rotation: 40, yoyo: true, repeat: numSteps,
            duration: stepTime, ease: "sine.inOut",
            delay: stepTime / 2  // offset so knees alternate
        }, startPos);

        // --- BODY BOB: up/down with each step ---
        timeline.to("#bat-body-group", {
            y: -4, yoyo: true, repeat: numSteps * 2,
            duration: stepTime / 2, ease: "sine.inOut"
        }, startPos);

        // --- CAPE: sway with movement ---
        timeline.to("#bat-cape-group", {
            rotation: 3, yoyo: true, repeat: numSteps,
            duration: stepTime * 1.2, ease: "sine.inOut"
        }, startPos);
        timeline.to("#bat-cape", {
            skewX: 2.5, scaleY: 1.03, yoyo: true, repeat: numSteps,
            transformOrigin: "50% 0%",
            duration: stepTime, ease: "sine.inOut"
        }, startPos);
    }

    const introTl = gsap.timeline({
        onComplete: () => {
            gsap.to("#scroll-hint", { opacity: 1, duration: 1, delay: 0.3 });
            // Reset all limbs to standing pose
            gsap.to(["#bat-leg-left", "#bat-leg-right", "#bat-shin-left", "#bat-shin-right",
                "#bat-body-group", "#bat-cape-group"], {
                rotation: 0, y: 0, skewX: 0, scaleY: 1, duration: 0.3, ease: "power2.out"
            });
        }
    });

    const walkDuration = 2;

    // Batman runs in from left to position
    introTl.to("#batman-container", {
        left: "15%",
        xPercent: -50,
        duration: walkDuration,
        ease: "power2.out"
    }, 0);

    // Apply walk cycle to intro
    createWalkCycle(introTl, walkDuration, 0);

    // ═══════════════════════════════════════
    //  IDLE CAPE ANIMATION (always running)
    // ═══════════════════════════════════════
    gsap.to("#bat-cape", {
        scaleY: 1.03,
        skewX: 0.5,
        transformOrigin: "50% 0%",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: walkDuration
    });

    // ═══════════════════════════════════════
    //  LIGHTNING EFFECT (every 3 seconds)
    // ═══════════════════════════════════════
    function triggerLightning() {
        const bolt = Math.random() > 0.5 ? "#lightning-1" : "#lightning-2";
        const flashTl = gsap.timeline();

        // Quick double-strike pattern (realistic lightning)
        flashTl
            .to(bolt, { opacity: 1, duration: 0.05 })
            .to(bolt, { opacity: 0, duration: 0.05 })
            .to(bolt, { opacity: 1, duration: 0.08 })
            .to(bolt, { opacity: 0.6, duration: 0.1 })
            .to(bolt, { opacity: 0, duration: 0.15 });

        // Sky flash glow
        flashTl
            .to("#sky-flash", { opacity: 1, duration: 0.05 }, 0)
            .to("#sky-flash", { opacity: 0, duration: 0.05 }, 0.1)
            .to("#sky-flash", { opacity: 0.7, duration: 0.08 }, 0.15)
            .to("#sky-flash", { opacity: 0, duration: 0.3 }, 0.25);

        // Flash bat-signal stations (glare effect on visible ones)
        document.querySelectorAll('.bat-signal-station').forEach(st => {
            if (parseFloat(getComputedStyle(st).opacity) > 0.5) {
                st.classList.add('lightning-flash');
                setTimeout(() => st.classList.remove('lightning-flash'), 400);
            }
        });
    }

    // Start lightning loop
    setInterval(triggerLightning, 5000);
    // First strike after 1.5s
    setTimeout(triggerLightning, 1500);

    // ═══════════════════════════════════════
    //  SCROLL TIMELINE
    // ═══════════════════════════════════════
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5
        }
    });

    // Total timeline duration units = 100
    const D = 100;

    // --- Phase 1: Batman walks to Batmobile (scroll 0-10%) ---
    // Hide scroll hint
    tl.to("#scroll-hint", { opacity: 0, duration: D * 0.02 }, 0);

    // Batman walks toward Batmobile
    tl.to("#batman-container", {
        left: "20%",
        duration: D * 0.08,
        ease: "none"
    }, 0);

    // Apply walk cycle during scroll walk
    createWalkCycle(tl, D * 0.08, 0);

    // --- Phase 1b: Batman gets in the car (scroll 8-14%) ---
    // Batman fades out (getting in)
    tl.to("#batman-container", {
        opacity: 0,
        scale: 0.7,
        y: 20,
        duration: D * 0.04,
        ease: "power2.in"
    }, D * 0.09);

    // Batman appears in car
    tl.to("#batman-in-car", {
        opacity: 1,
        duration: D * 0.03
    }, D * 0.12);

    // Move Batmobile to center
    tl.to("#batmobile-container", {
        left: "50%",
        duration: D * 0.05,
        ease: "power1.inOut"
    }, D * 0.12);

    // Exhaust fire starts
    tl.to("#exhaust-glow", {
        opacity: 0.8,
        duration: D * 0.02
    }, D * 0.16);

    // --- Phase 2: Batmobile drives, buildings parallax (scroll 18-100%) ---
    // Buildings parallax (continuous movement)
    tl.to("#buildings-layer", {
        x: "-70%",
        duration: D * 0.80,
        ease: "none"
    }, D * 0.18);

    // Sky parallax (slower)
    tl.to("#sky-layer svg", {
        x: "-15%",
        duration: D * 0.80,
        ease: "none"
    }, D * 0.18);

    // Batmobile subtle bounce while driving
    tl.to("#batmobile-container", {
        y: -3,
        duration: D * 0.008,
        repeat: Math.floor(D * 0.80 / (D * 0.008)),
        yoyo: true,
        ease: "sine.inOut"
    }, D * 0.18);

    // Wheel spin effect (we rotate wheel elements)
    // Since SVG circles look the same rotated, we add visual effect through the container

    // --- Bat-Signal Station 1 (scroll 25-42%) ---
    tl.to("#st-1", {
        opacity: 1,
        duration: D * 0.04,
        ease: "power2.out"
    }, D * 0.25);

    tl.to("#st-1", {
        opacity: 0,
        duration: D * 0.04,
        ease: "power2.in"
    }, D * 0.38);

    // --- Bat-Signal Station 2 (scroll 48-65%) ---
    tl.to("#st-2", {
        opacity: 1,
        duration: D * 0.04,
        ease: "power2.out"
    }, D * 0.48);

    tl.to("#st-2", {
        opacity: 0,
        duration: D * 0.04,
        ease: "power2.in"
    }, D * 0.60);

    // --- Bat-Signal Station 3 (scroll 70-87%) ---
    tl.to("#st-3", {
        opacity: 1,
        duration: D * 0.04,
        ease: "power2.out"
    }, D * 0.70);

    tl.to("#st-3", {
        opacity: 0,
        duration: D * 0.04,
        ease: "power2.in"
    }, D * 0.83);

});