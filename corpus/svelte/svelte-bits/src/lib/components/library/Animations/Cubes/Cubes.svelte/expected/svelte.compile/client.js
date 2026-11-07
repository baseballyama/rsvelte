import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gsap } from 'gsap';

var root = $.from_html(`<div class="cube relative w-full h-full aspect-square" style="transform-style:preserve-3d;"><span class="absolute pointer-events-none -inset-9"></span> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:translateY(-50%) rotateX(90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:translateY(50%) rotateX(-90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:translateX(-50%) rotateY(-90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:translateX(50%) rotateY(90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:rotateY(-90deg) translateX(50%) rotateY(90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:rotateY(90deg) translateX(-50%) rotateY(-90deg);"></div></div>`);
var root_1 = $.from_html(`<div><div class="grid w-full h-full"></div></div>`);

export default function Cubes($$anchor, $$props) {
	$.push($$props, true);

	let gridSize = $.prop($$props, 'gridSize', 3, 10),
		maxAngle = $.prop($$props, 'maxAngle', 3, 45),
		radius = $.prop($$props, 'radius', 3, 3),
		easing = $.prop($$props, 'easing', 3, 'power3.out'),
		duration = $.prop($$props, 'duration', 19, () => ({ enter: 0.3, leave: 0.6 })),
		borderStyle = $.prop($$props, 'borderStyle', 3, '1px solid #fff'),
		faceColor = $.prop($$props, 'faceColor', 3, '#120F17'),
		shadow = $.prop($$props, 'shadow', 3, false),
		autoAnimate = $.prop($$props, 'autoAnimate', 3, true),
		rippleOnClick = $.prop($$props, 'rippleOnClick', 3, true),
		rippleColor = $.prop($$props, 'rippleColor', 3, '#fff'),
		rippleSpeed = $.prop($$props, 'rippleSpeed', 3, 2),
		className = $.prop($$props, 'class', 3, '');

	let scene;

	const colGap = $.derived(() => typeof $$props.cellGap === 'number'
		? `${$$props.cellGap}px`
		: $$props.cellGap && $$props.cellGap.col !== undefined ? `${$$props.cellGap.col}px` : '5%');

	const rowGap = $.derived(() => typeof $$props.cellGap === 'number'
		? `${$$props.cellGap}px`
		: $$props.cellGap && $$props.cellGap.row !== undefined ? `${$$props.cellGap.row}px` : '5%');

	function tiltAt(rowCenter, colCenter) {
		if (!scene) return;

		scene.querySelectorAll('.cube').forEach((cube) => {
			const r = +cube.dataset.row;
			const c = +cube.dataset.col;
			const dist = Math.hypot(r - rowCenter, c - colCenter);

			if (dist <= radius()) {
				const pct = 1 - dist / radius();
				const angle = pct * maxAngle();

				gsap.to(cube, {
					duration: duration().enter,
					ease: easing(),
					overwrite: true,
					rotateX: -angle,
					rotateY: angle
				});
			} else {
				gsap.to(cube, {
					duration: duration().leave,
					ease: 'power3.out',
					overwrite: true,
					rotateX: 0,
					rotateY: 0
				});
			}
		});
	}

	function resetAll() {
		if (!scene) return;

		scene.querySelectorAll('.cube').forEach((cube) => gsap.to(cube, {
			duration: duration().leave,
			rotateX: 0,
			rotateY: 0,
			ease: 'power3.out'
		}));
	}

	$.user_effect(() => {
		if (!scene) return;

		let raf = null;
		let idleTimer = null;
		let userActive = false;
		let simRAF = null;

		const onPointerMove = (e) => {
			userActive = true;

			if (idleTimer) clearTimeout(idleTimer);

			const rect = scene.getBoundingClientRect();
			const cellW = rect.width / gridSize();
			const cellH = rect.height / gridSize();
			const colCenter = (e.clientX - rect.left) / cellW;
			const rowCenter = (e.clientY - rect.top) / cellH;

			if (raf) cancelAnimationFrame(raf);

			raf = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
			idleTimer = setTimeout(() => userActive = false, 3000);
		};

		const onTouchMove = (e) => {
			e.preventDefault();
			userActive = true;

			if (idleTimer) clearTimeout(idleTimer);

			const rect = scene.getBoundingClientRect();
			const cellW = rect.width / gridSize();
			const cellH = rect.height / gridSize();
			const t = e.touches[0];
			const colCenter = (t.clientX - rect.left) / cellW;
			const rowCenter = (t.clientY - rect.top) / cellH;

			if (raf) cancelAnimationFrame(raf);

			raf = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
			idleTimer = setTimeout(() => userActive = false, 3000);
		};

		const onTouchStart = () => {
			userActive = true;
		};

		const onTouchEnd = () => resetAll();

		const onClick = (e) => {
			if (!rippleOnClick() || !scene) return;

			const rect = scene.getBoundingClientRect();
			const cellW = rect.width / gridSize();
			const cellH = rect.height / gridSize();
			const cx = e.clientX ?? (e.touches && e.touches[0].clientX);
			const cy = e.clientY ?? (e.touches && e.touches[0].clientY);
			const colHit = Math.floor((cx - rect.left) / cellW);
			const rowHit = Math.floor((cy - rect.top) / cellH);
			const baseRingDelay = 0.15;
			const baseAnimDur = 0.3;
			const baseHold = 0.6;
			const spreadDelay = baseRingDelay / rippleSpeed();
			const animDuration = baseAnimDur / rippleSpeed();
			const holdTime = baseHold / rippleSpeed();
			const rings = {};

			scene.querySelectorAll('.cube').forEach((cube) => {
				const r = +cube.dataset.row;
				const c = +cube.dataset.col;
				const ring = Math.round(Math.hypot(r - rowHit, c - colHit));

				(rings[ring] ||= []).push(cube);
			});

			Object.keys(rings).map(Number).sort((a, b) => a - b).forEach((ring) => {
				const delay = ring * spreadDelay;
				const faces = rings[ring].flatMap((cube) => Array.from(cube.querySelectorAll('.cube-face')));

				gsap.to(faces, {
					backgroundColor: rippleColor(),
					duration: animDuration,
					delay,
					ease: 'power3.out'
				});

				gsap.to(faces, {
					backgroundColor: faceColor(),
					duration: animDuration,
					delay: delay + animDuration + holdTime,
					ease: 'power3.out'
				});
			});
		};

		scene.addEventListener('pointermove', onPointerMove);
		scene.addEventListener('pointerleave', resetAll);
		scene.addEventListener('click', onClick);
		scene.addEventListener('touchmove', onTouchMove, { passive: false });
		scene.addEventListener('touchstart', onTouchStart, { passive: true });
		scene.addEventListener('touchend', onTouchEnd, { passive: true });

		if (autoAnimate()) {
			let pos = { x: Math.random() * gridSize(), y: Math.random() * gridSize() };
			let tgt = { x: Math.random() * gridSize(), y: Math.random() * gridSize() };
			const speed = 0.02;

			const loop = () => {
				if (!userActive) {
					pos.x += (tgt.x - pos.x) * speed;
					pos.y += (tgt.y - pos.y) * speed;
					tiltAt(pos.y, pos.x);

					if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
						tgt = { x: Math.random() * gridSize(), y: Math.random() * gridSize() };
					}
				}

				simRAF = requestAnimationFrame(loop);
			};

			simRAF = requestAnimationFrame(loop);
		}

		return () => {
			scene.removeEventListener('pointermove', onPointerMove);
			scene.removeEventListener('pointerleave', resetAll);
			scene.removeEventListener('click', onClick);
			scene.removeEventListener('touchmove', onTouchMove);
			scene.removeEventListener('touchstart', onTouchStart);
			scene.removeEventListener('touchend', onTouchEnd);

			if (raf) cancelAnimationFrame(raf);
			if (simRAF) cancelAnimationFrame(simRAF);
			if (idleTimer) clearTimeout(idleTimer);
		};
	});

	const cells = $.derived(() => Array.from({ length: gridSize() }));

	const wrapStyleParts = $.derived(() => {
		const parts = [
			`--cube-face-border:${borderStyle()}`,
			`--cube-face-bg:${faceColor()}`,
			`--cube-face-shadow:${shadow() === true ? '0 0 6px rgba(0,0,0,.5)' : shadow() || 'none'}`
		];

		if ($$props.cubeSize) {
			parts.push(`width:${gridSize() * $$props.cubeSize}px`);
			parts.push(`height:${gridSize() * $$props.cubeSize}px`);
		}

		return parts.join(';');
	});

	const sceneStyle = $.derived(() => `grid-template-columns:${$$props.cubeSize
		? `repeat(${gridSize()}, ${$$props.cubeSize}px)`
		: `repeat(${gridSize()}, 1fr)`};grid-template-rows:${$$props.cubeSize
		? `repeat(${gridSize()}, ${$$props.cubeSize}px)`
		: `repeat(${gridSize()}, 1fr)`};column-gap:${$.get(colGap)};row-gap:${$.get(rowGap)};perspective:99999999px;grid-auto-rows:1fr;`);

	var div = root_1();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $.get(cells), $.index, ($$anchor, _r, r) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 17, () => $.get(cells), $.index, ($$anchor, _c, c) => {
			var div_2 = root();

			$.set_attribute(div_2, 'data-row', r);
			$.set_attribute(div_2, 'data-col', c);
			$.append($$anchor, div_2);
		});

		$.append($$anchor, fragment);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => scene = $$value, () => scene);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `relative w-1/2 max-md:w-11/12 aspect-square ${className() ?? ''}`);
		$.set_style(div, $.get(wrapStyleParts));
		$.set_style(div_1, $.get(sceneStyle));
	});

	$.append($$anchor, div);
	$.pop();
}