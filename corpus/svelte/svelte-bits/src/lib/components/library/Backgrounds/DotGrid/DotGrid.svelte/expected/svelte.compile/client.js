import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<section><div class="relative h-full w-full"><canvas class="pointer-events-none absolute inset-0 h-full w-full"></canvas></div></section>`);

export default function DotGrid($$anchor, $$props) {
	$.push($$props, true);

	let dotSize = $.prop($$props, 'dotSize', 3, 16),
		gap = $.prop($$props, 'gap', 3, 32),
		baseColor = $.prop($$props, 'baseColor', 3, '#5c2a08'),
		activeColor = $.prop($$props, 'activeColor', 3, '#ff8a3d'),
		proximity = $.prop($$props, 'proximity', 3, 150),
		speedTrigger = $.prop($$props, 'speedTrigger', 3, 100),
		shockRadius = $.prop($$props, 'shockRadius', 3, 250),
		shockStrength = $.prop($$props, 'shockStrength', 3, 5),
		maxSpeed = $.prop($$props, 'maxSpeed', 3, 5000),
		resistance = $.prop($$props, 'resistance', 3, 750),
		returnDuration = $.prop($$props, 'returnDuration', 3, 1.5),
		className = $.prop($$props, 'class', 3, '');

	let wrapperRef;
	let canvasRef;

	function hexToRgb(hex) {
		const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

		if (!m) return { r: 0, g: 0, b: 0 };

		return {
			r: parseInt(m[1], 16),
			g: parseInt(m[2], 16),
			b: parseInt(m[3], 16)
		};
	}

	function throttle(fn, limit) {
		let last = 0;

		return (...args) => {
			const now = performance.now();

			if (now - last >= limit) {
				last = now;
				fn(...args);
			}
		};
	}

	onMount(() => {
		let dots = [];

		const pointer = {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			speed: 0,
			lastTime: 0,
			lastX: 0,
			lastY: 0
		};

		const circlePath = new Path2D();

		circlePath.arc(0, 0, dotSize() / 2, 0, Math.PI * 2);

		const buildGrid = () => {
			const { width, height } = wrapperRef.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;

			canvasRef.width = width * dpr;
			canvasRef.height = height * dpr;
			canvasRef.style.width = `${width}px`;
			canvasRef.style.height = `${height}px`;

			const ctx = canvasRef.getContext('2d');

			if (ctx) ctx.scale(dpr, dpr);

			const cols = Math.floor((width + gap()) / (dotSize() + gap()));
			const rows = Math.floor((height + gap()) / (dotSize() + gap()));
			const cell = dotSize() + gap();
			const gridW = cell * cols - gap();
			const gridH = cell * rows - gap();
			const startX = (width - gridW) / 2 + dotSize() / 2;
			const startY = (height - gridH) / 2 + dotSize() / 2;
			const next = [];

			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					next.push({
						cx: startX + x * cell,
						cy: startY + y * cell,
						xOffset: 0,
						yOffset: 0,
						_inertiaApplied: false
					});
				}
			}

			dots = next;
		};

		buildGrid();

		const ro = new ResizeObserver(buildGrid);

		ro.observe(wrapperRef);

		let raf = 0;
		const proxSq = () => proximity() * proximity();

		const draw = () => {
			const ctx = canvasRef.getContext('2d');

			if (ctx) {
				ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

				const baseRgb = hexToRgb(baseColor());
				const activeRgb = hexToRgb(activeColor());

				for (const dot of dots) {
					const ox = dot.cx + dot.xOffset;
					const oy = dot.cy + dot.yOffset;
					const dx = dot.cx - pointer.x;
					const dy = dot.cy - pointer.y;
					const dsq = dx * dx + dy * dy;
					let style = baseColor();

					if (dsq <= proxSq()) {
						const dist = Math.sqrt(dsq);
						const t = 1 - dist / proximity();
						const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
						const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
						const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);

						style = `rgb(${r},${g},${b})`;
					}

					ctx.save();
					ctx.translate(ox, oy);
					ctx.fillStyle = style;
					ctx.fill(circlePath);
					ctx.restore();
				}
			}

			raf = requestAnimationFrame(draw);
		};

		draw();

		const pushDot = (dot, pushX, pushY) => {
			dot._inertiaApplied = true;
			gsap.killTweensOf(dot);

			const decayDuration = Math.min(2, resistance() / 600);

			gsap.to(dot, {
				xOffset: pushX,
				yOffset: pushY,
				duration: decayDuration,
				ease: 'power3.out',
				onComplete: () => {
					gsap.to(dot, {
						xOffset: 0,
						yOffset: 0,
						duration: returnDuration(),
						ease: 'elastic.out(1,0.75)'
					});

					dot._inertiaApplied = false;
				}
			});
		};

		const onMove = (e) => {
			const now = performance.now();
			const dt = pointer.lastTime ? now - pointer.lastTime : 16;
			const dx = e.clientX - pointer.lastX;
			const dy = e.clientY - pointer.lastY;
			let vx = dx / dt * 1000;
			let vy = dy / dt * 1000;
			let speed = Math.hypot(vx, vy);

			if (speed > maxSpeed()) {
				const scale = maxSpeed() / speed;

				vx *= scale;
				vy *= scale;
				speed = maxSpeed();
			}

			pointer.lastTime = now;
			pointer.lastX = e.clientX;
			pointer.lastY = e.clientY;
			pointer.vx = vx;
			pointer.vy = vy;
			pointer.speed = speed;

			const rect = canvasRef.getBoundingClientRect();

			pointer.x = e.clientX - rect.left;
			pointer.y = e.clientY - rect.top;

			for (const dot of dots) {
				const dist = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);

				if (speed > speedTrigger() && dist < proximity() && !dot._inertiaApplied) {
					pushDot(dot, dot.cx - pointer.x + vx * 0.005, dot.cy - pointer.y + vy * 0.005);
				}
			}
		};

		const onClick = (e) => {
			const rect = canvasRef.getBoundingClientRect();
			const cx = e.clientX - rect.left;
			const cy = e.clientY - rect.top;

			for (const dot of dots) {
				const dist = Math.hypot(dot.cx - cx, dot.cy - cy);

				if (dist < shockRadius() && !dot._inertiaApplied) {
					const falloff = Math.max(0, 1 - dist / shockRadius());

					pushDot(dot, (dot.cx - cx) * shockStrength() * falloff, (dot.cy - cy) * shockStrength() * falloff);
				}
			}
		};

		const throttledMove = throttle(onMove, 50);

		window.addEventListener('mousemove', throttledMove, { passive: true });
		window.addEventListener('click', onClick);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			window.removeEventListener('mousemove', throttledMove);
			window.removeEventListener('click', onClick);
		};
	});

	var section = root();
	var div = $.child(section);
	var canvas = $.child(div);

	$.bind_this(canvas, ($$value) => canvasRef = $$value, () => canvasRef);
	$.reset(div);
	$.bind_this(div, ($$value) => wrapperRef = $$value, () => wrapperRef);
	$.reset(section);
	$.template_effect(() => $.set_class(section, 1, `relative flex h-full w-full items-center justify-center p-4 ${className() ?? ''}`));
	$.append($$anchor, section);
	$.pop();
}