import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

function hexToRgba(hex, alpha = 1) {
	if (!hex) return `rgba(0,0,0,${alpha})`;

	let h = hex.replace('#', '');

	if (h.length === 3) h = h.split('').map((c) => c + c).join('');

	const int = parseInt(h, 16);
	const r = int >> 16 & 255;
	const g = int >> 8 & 255;
	const b = int & 255;

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

var root = $.from_html(`<div><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2]"><canvas class="block"></canvas></div> <div class="absolute inset-0 rounded-[inherit] pointer-events-none z-0"><div class="absolute inset-0 rounded-[inherit] pointer-events-none"></div> <div class="absolute inset-0 rounded-[inherit] pointer-events-none"></div> <div class="absolute inset-0 rounded-[inherit] pointer-events-none -z-[1] scale-110 opacity-30"></div></div> <div class="relative rounded-[inherit] z-[1]"><!></div></div>`);

export default function ElectricBorder($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, '#FF8A4C'),
		speed = $.prop($$props, 'speed', 3, 1),
		chaos = $.prop($$props, 'chaos', 3, 0.12),
		borderRadius = $.prop($$props, 'borderRadius', 3, 24),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, '');

	let canvas;
	let container;

	$.user_effect(() => {
		if (!canvas || !container) return;

		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		const octaves = 10;
		const lacunarity = 1.6;
		const gain = 0.7;
		const frequency = 10;
		const baseFlatness = 0;
		const displacement = 60;
		const borderOffset = 60;
		let time = 0;
		let lastFrame = 0;
		let raf = null;
		const random = (x) => Math.sin(x * 12.9898) * 43758.5453 % 1;

		const noise2D = (x, y) => {
			const i = Math.floor(x);
			const j = Math.floor(y);
			const fx = x - i;
			const fy = y - j;
			const a = random(i + j * 57);
			const b = random(i + 1 + j * 57);
			const c = random(i + (j + 1) * 57);
			const d = random(i + 1 + (j + 1) * 57);
			const ux = fx * fx * (3 - 2 * fx);
			const uy = fy * fy * (3 - 2 * fy);

			return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
		};

		const octavedNoise = (x, t, seed) => {
			let y = 0;
			let amp = chaos();
			let freq = frequency;

			for (let i = 0; i < octaves; i++) {
				let oa = amp;

				if (i === 0) oa *= baseFlatness;

				y += oa * noise2D(freq * x + seed * 100, t * freq * 0.3);
				freq *= lacunarity;
				amp *= gain;
			}

			return y;
		};

		const cornerPoint = (cx, cy, r, startA, arcLen, p) => {
			const a = startA + p * arcLen;

			return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
		};

		const rectPoint = (t, l, tp, w, h, r) => {
			const sw = w - 2 * r;
			const sh = h - 2 * r;
			const ca = Math.PI * r / 2;
			const total = 2 * sw + 2 * sh + 4 * ca;
			const d = t * total;
			let acc = 0;

			if (d <= acc + sw) return { x: l + r + (d - acc) / sw * sw, y: tp };

			acc += sw;

			if (d <= acc + ca) return cornerPoint(l + w - r, tp + r, r, -Math.PI / 2, Math.PI / 2, (d - acc) / ca);

			acc += ca;

			if (d <= acc + sh) return { x: l + w, y: tp + r + (d - acc) / sh * sh };

			acc += sh;

			if (d <= acc + ca) return cornerPoint(l + w - r, tp + h - r, r, 0, Math.PI / 2, (d - acc) / ca);

			acc += ca;

			if (d <= acc + sw) return { x: l + w - r - (d - acc) / sw * sw, y: tp + h };

			acc += sw;

			if (d <= acc + ca) return cornerPoint(l + r, tp + h - r, r, Math.PI / 2, Math.PI / 2, (d - acc) / ca);

			acc += ca;

			if (d <= acc + sh) return { x: l, y: tp + h - r - (d - acc) / sh * sh };

			acc += sh;

			return cornerPoint(l + r, tp + r, r, Math.PI, Math.PI / 2, (d - acc) / ca);
		};

		let width = 0;
		let height = 0;

		const updateSize = () => {
			const rect = container.getBoundingClientRect();

			width = rect.width + borderOffset * 2;
			height = rect.height + borderOffset * 2;

			const dpr = Math.min(window.devicePixelRatio || 1, 2);

			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.scale(dpr, dpr);
		};

		updateSize();

		const draw = (now) => {
			const dt = (now - lastFrame) / 1000;

			time += dt * speed();
			lastFrame = now;

			const dpr = Math.min(window.devicePixelRatio || 1, 2);

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.scale(dpr, dpr);
			ctx.strokeStyle = color();
			ctx.lineWidth = 1;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			const left = borderOffset;
			const top = borderOffset;
			const bw = width - 2 * borderOffset;
			const bh = height - 2 * borderOffset;
			const maxR = Math.min(bw, bh) / 2;
			const r = Math.min(borderRadius(), maxR);
			const perim = 2 * (bw + bh) + 2 * Math.PI * r;
			const samples = Math.floor(perim / 2);

			ctx.beginPath();

			for (let i = 0; i <= samples; i++) {
				const p = i / samples;
				const pt = rectPoint(p, left, top, bw, bh, r);
				const xn = octavedNoise(p * 8, time, 0);
				const yn = octavedNoise(p * 8, time, 1);
				const dx = pt.x + xn * displacement;
				const dy = pt.y + yn * displacement;

				if (i === 0) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
			}

			ctx.closePath();
			ctx.stroke();
			raf = requestAnimationFrame(draw);
		};

		const ro = new ResizeObserver(updateSize);

		ro.observe(container);
		raf = requestAnimationFrame(draw);

		return () => {
			if (raf) cancelAnimationFrame(raf);

			ro.disconnect();
		};
	});

	var div = root();
	var div_1 = $.child(div);
	var canvas_1 = $.child(div_1);

	$.bind_this(canvas_1, ($$value) => canvas = $$value, () => canvas);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);

	$.reset(div_2);

	var div_6 = $.sibling(div_2, 2);
	var node = $.child(div_6);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_6);
	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, `relative overflow-visible isolate ${className() ?? ''}`);
			$.set_style(div, `--electric-border-color:${color() ?? ''};border-radius:${borderRadius() ?? ''}px;${style() ?? ''}`);
			$.set_style(div_3, `border:2px solid ${$0 ?? ''};filter:blur(1px);`);
			$.set_style(div_4, `border:2px solid ${color() ?? ''};filter:blur(4px);`);
			$.set_style(div_5, `filter:blur(32px);background:linear-gradient(-30deg, ${color() ?? ''}, transparent, ${color() ?? ''});`);
		},
		[() => hexToRgba(color(), 0.6)]
	);

	$.append($$anchor, div);
	$.pop();
}