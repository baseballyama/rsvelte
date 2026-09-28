import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const TWO_PI = Math.PI * 2;
var root_1 = $.from_html(`<div><canvas class="absolute inset-0 h-full w-full"></canvas> <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"><defs><radialGradient><stop offset="0%"></stop><stop offset="100%" stop-color="transparent"></stop></radialGradient></defs><circle cx="-9999" cy="-9999"></circle></svg></div>`);

export default function Dot_pattern($$anchor, $$props) {
	$.push($$props, true);

	let dotRadius = $.prop($$props, 'dotRadius', 3, 1.5),
		dotSpacing = $.prop($$props, 'dotSpacing', 3, 14),
		cursorRadius = $.prop($$props, 'cursorRadius', 3, 500),
		cursorForce = $.prop($$props, 'cursorForce', 3, 0.1),
		bulgeOnly = $.prop($$props, 'bulgeOnly', 3, true),
		bulgeStrength = $.prop($$props, 'bulgeStrength', 3, 67),
		glowRadius = $.prop($$props, 'glowRadius', 3, 160),
		sparkle = $.prop($$props, 'sparkle', 3, false),
		waveAmplitude = $.prop($$props, 'waveAmplitude', 3, 0),
		gradientFrom = $.prop($$props, 'gradientFrom', 3, 'rgba(255, 62, 0, 0.35)'),
		gradientTo = $.prop($$props, 'gradientTo', 3, 'rgba(255, 176, 137, 0.25)'),
		glowColor = $.prop($$props, 'glowColor', 3, '#14110E'),
		className = $.prop($$props, 'class', 3, '');

	let root;
	let canvas;
	let glowEl;
	const glowId = `dot-field-glow-${Math.random().toString(36).slice(2, 9)}`;
	let dots = [];
	const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
	let size = { w: 0, h: 0, offsetX: 0, offsetY: 0 };
	let glowOpacity = 0;
	let engagement = 0;
	let rebuild = null;

	$.user_effect(() => {
		const currentCanvas = canvas;
		const currentRoot = root;
		const currentGlow = glowEl;

		if (!currentCanvas || !currentRoot) return;

		const ctx = currentCanvas.getContext('2d', { alpha: true });

		if (!ctx) return;

		const context = ctx;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		let resizeTimer;
		let raf = 0;
		let frameCount = 0;

		function buildDots(w, h) {
			const step = dotRadius() + dotSpacing();
			const cols = Math.floor(w / step);
			const rows = Math.floor(h / step);
			const padX = w % step / 2;
			const padY = h % step / 2;
			const nextDots = new Array(rows * cols);
			let idx = 0;

			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const ax = padX + col * step + step / 2;
					const ay = padY + row * step + step / 2;

					nextDots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
				}
			}

			dots = nextDots;
		}

		function doResize() {
			const rect = currentRoot.getBoundingClientRect();
			const w = rect.width;
			const h = rect.height;

			currentCanvas.width = w * dpr;
			currentCanvas.height = h * dpr;
			currentCanvas.style.width = `${w}px`;
			currentCanvas.style.height = `${h}px`;
			context.setTransform(dpr, 0, 0, dpr, 0, 0);

			size = {
				w,
				h,
				offsetX: rect.left + window.scrollX,
				offsetY: rect.top + window.scrollY
			};

			buildDots(w, h);
		}

		function resize() {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(doResize, 100);
		}

		function onMouseMove(e) {
			mouse.x = e.pageX - size.offsetX;
			mouse.y = e.pageY - size.offsetY;
		}

		function updateMouseSpeed() {
			const dx = mouse.prevX - mouse.x;
			const dy = mouse.prevY - mouse.y;
			const dist = Math.sqrt(dx * dx + dy * dy);

			mouse.speed += (dist - mouse.speed) * 0.5;

			if (mouse.speed < 0.001) mouse.speed = 0;

			mouse.prevX = mouse.x;
			mouse.prevY = mouse.y;
		}

		const speedInterval = setInterval(updateMouseSpeed, 20);

		function tick() {
			frameCount++;

			const len = dots.length;
			const { w, h } = size;
			const t = frameCount * 0.02;
			const targetEngagement = Math.min(mouse.speed / 5, 1);

			engagement += (targetEngagement - engagement) * 0.06;

			if (engagement < 0.001) engagement = 0;

			glowOpacity += (engagement - glowOpacity) * 0.08;

			if (currentGlow) {
				currentGlow.setAttribute('cx', String(mouse.x));
				currentGlow.setAttribute('cy', String(mouse.y));
				currentGlow.style.opacity = String(glowOpacity);
			}

			context.clearRect(0, 0, w, h);

			const grad = context.createLinearGradient(0, 0, w, h);

			grad.addColorStop(0, gradientFrom());
			grad.addColorStop(1, gradientTo());
			context.fillStyle = grad;

			const crSq = cursorRadius() * cursorRadius();
			const rad = dotRadius() / 2;

			context.beginPath();

			for (let i = 0; i < len; i++) {
				const d = dots[i];
				const dx = mouse.x - d.ax;
				const dy = mouse.y - d.ay;
				const distSq = dx * dx + dy * dy;

				if (distSq < crSq && engagement > 0.01) {
					const dist = Math.sqrt(distSq);
					const angle = Math.atan2(dy, dx);

					if (bulgeOnly()) {
						const falloff = 1 - dist / cursorRadius();
						const push = falloff * falloff * bulgeStrength() * engagement;

						d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
						d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
					} else {
						const safeDist = Math.max(dist, 0.001);
						const move = 500 / safeDist * (mouse.speed * cursorForce());

						d.vx += Math.cos(angle) * -move;
						d.vy += Math.sin(angle) * -move;
					}
				} else if (bulgeOnly()) {
					d.sx += (d.ax - d.sx) * 0.1;
					d.sy += (d.ay - d.sy) * 0.1;
				}

				if (!bulgeOnly()) {
					d.vx *= 0.9;
					d.vy *= 0.9;
					d.x = d.ax + d.vx;
					d.y = d.ay + d.vy;
					d.sx += (d.x - d.sx) * 0.1;
					d.sy += (d.y - d.sy) * 0.1;
				}

				let drawX = d.sx;
				let drawY = d.sy;

				if (waveAmplitude() > 0) {
					drawY += Math.sin(d.ax * 0.03 + t) * waveAmplitude();
					drawX += Math.cos(d.ay * 0.03 + t * 0.7) * waveAmplitude() * 0.5;
				}

				if (sparkle()) {
					const hash = (i * 2654435761 ^ frameCount >> 3) >>> 0;

					if (hash % 100 < 3) {
						context.moveTo(drawX + rad * 1.8, drawY);
						context.arc(drawX, drawY, rad * 1.8, 0, TWO_PI);
					} else {
						context.moveTo(drawX + rad, drawY);
						context.arc(drawX, drawY, rad, 0, TWO_PI);
					}
				} else {
					context.moveTo(drawX + rad, drawY);
					context.arc(drawX, drawY, rad, 0, TWO_PI);
				}
			}

			context.fill();
			raf = requestAnimationFrame(tick);
		}

		doResize();
		window.addEventListener('resize', resize);
		window.addEventListener('mousemove', onMouseMove, { passive: true });
		raf = requestAnimationFrame(tick);

		rebuild = () => {
			const { w, h } = size;

			if (w > 0 && h > 0) buildDots(w, h);
		};

		return () => {
			cancelAnimationFrame(raf);
			clearInterval(speedInterval);
			clearTimeout(resizeTimer);
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', onMouseMove);
		};
	});

	$.user_effect(() => {
		void dotRadius();
		void dotSpacing();
		rebuild?.();
	});

	var div = root_1();
	var canvas_1 = $.child(div);

	$.bind_this(canvas_1, ($$value) => canvas = $$value, () => canvas);

	var svg = $.sibling(canvas_1, 2);
	var defs = $.child(svg);
	var radialGradient = $.child(defs);
	var stop = $.child(radialGradient);

	$.next();
	$.reset(radialGradient);
	$.reset(defs);

	var circle = $.sibling(defs);

	$.set_style(circle, '', {}, { opacity: '0', 'will-change': 'opacity' });
	$.bind_this(circle, ($$value) => glowEl = $$value, () => glowEl);
	$.reset(svg);
	$.reset(div);
	$.bind_this(div, ($$value) => root = $$value, () => root);

	$.template_effect(() => {
		$.set_class(div, 1, `relative h-full w-full ${className() ?? ''}`);
		$.set_attribute(radialGradient, 'id', glowId);
		$.set_attribute(stop, 'stop-color', glowColor());
		$.set_attribute(circle, 'r', glowRadius());
		$.set_attribute(circle, 'fill', `url(#${glowId})`);
	});

	$.append($$anchor, div);
	$.pop();
}