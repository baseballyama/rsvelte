import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="pointer-events-none absolute inset-0" style="background: radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)"></div>`);
var root_1 = $.from_html(`<div class="pointer-events-none absolute inset-0" style="background: radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)"></div>`);
var root_2 = $.from_html(`<div class="relative h-full w-full overflow-hidden"><canvas class="block h-full w-full"></canvas> <!> <!></div>`);

export default function LetterGlitch($$anchor, $$props) {
	$.push($$props, true);

	let glitchColors = $.prop($$props, 'glitchColors', 19, () => ['#2b4539', '#61dca3', '#61b3dc']),
		glitchSpeed = $.prop($$props, 'glitchSpeed', 3, 50),
		centerVignette = $.prop($$props, 'centerVignette', 3, false),
		outerVignette = $.prop($$props, 'outerVignette', 3, true),
		smooth = $.prop($$props, 'smooth', 3, true),
		characters = $.prop($$props, 'characters', 3, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789');

	let canvasRef;

	const current = $.derived(() => ({
		glitchColors: glitchColors(),
		glitchSpeed: glitchSpeed(),
		smooth: smooth(),
		characters: characters()
	}));

	onMount(() => {
		const fontSize = 16;
		const charWidth = 10;
		const charHeight = 20;
		let lettersAndSymbols = Array.from($.get(current).characters);
		let letters = [];
		const grid = { columns: 0, rows: 0 };
		let lastGlitchTime = Date.now();
		let raf = 0;
		const ctx = canvasRef.getContext('2d');
		const getRandomChar = () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
		const getRandomColor = () => $.get(current).glitchColors[Math.floor(Math.random() * $.get(current).glitchColors.length)];

		const hexToRgb = (hex) => {
			const sh = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

			hex = hex.replace(sh, (_m, r, g, b) => r + r + g + g + b + b);

			const r = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex);

			return r
				? {
					r: parseInt(r[1], 16),
					g: parseInt(r[2], 16),
					b: parseInt(r[3], 16)
				}
				: null;
		};

		const interpolateColor = (a, b, t) => `rgb(${Math.round(a.r + (b.r - a.r) * t)}, ${Math.round(a.g + (b.g - a.g) * t)}, ${Math.round(a.b + (b.b - a.b) * t)})`;

		const initializeLetters = (cols, rows) => {
			grid.columns = cols;
			grid.rows = rows;

			const total = cols * rows;

			letters = Array.from({ length: total }, () => ({
				char: getRandomChar(),
				color: getRandomColor(),
				targetColor: getRandomColor(),
				colorProgress: 1
			}));
		};

		const resizeCanvas = () => {
			const parent = canvasRef.parentElement;

			if (!parent) return;

			const dpr = window.devicePixelRatio || 1;
			const rect = parent.getBoundingClientRect();

			canvasRef.width = rect.width * dpr;
			canvasRef.height = rect.height * dpr;
			canvasRef.style.width = `${rect.width}px`;
			canvasRef.style.height = `${rect.height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			initializeLetters(Math.ceil(rect.width / charWidth), Math.ceil(rect.height / charHeight));
			drawLetters();
		};

		const drawLetters = () => {
			if (letters.length === 0) return;

			const { width, height } = canvasRef.getBoundingClientRect();

			ctx.clearRect(0, 0, width, height);
			ctx.font = `${fontSize}px monospace`;
			ctx.textBaseline = 'top';

			for (let i = 0; i < letters.length; i++) {
				const x = i % grid.columns * charWidth;
				const y = Math.floor(i / grid.columns) * charHeight;

				ctx.fillStyle = letters[i].color;
				ctx.fillText(letters[i].char, x, y);
			}
		};

		const updateLetters = () => {
			if (!letters.length) return;

			const updateCount = Math.max(1, Math.floor(letters.length * 0.05));

			for (let i = 0; i < updateCount; i++) {
				const idx = Math.floor(Math.random() * letters.length);

				letters[idx].char = getRandomChar();
				letters[idx].targetColor = getRandomColor();

				if (!$.get(current).smooth) {
					letters[idx].color = letters[idx].targetColor;
					letters[idx].colorProgress = 1;
				} else {
					letters[idx].colorProgress = 0;
				}
			}
		};

		const handleSmoothTransitions = () => {
			let needsRedraw = false;

			for (const letter of letters) {
				if (letter.colorProgress < 1) {
					letter.colorProgress += 0.05;

					if (letter.colorProgress > 1) letter.colorProgress = 1;

					const a = hexToRgb(letter.color);
					const b = hexToRgb(letter.targetColor);

					if (a && b) {
						letter.color = interpolateColor(a, b, letter.colorProgress);
						needsRedraw = true;
					}
				}
			}

			if (needsRedraw) drawLetters();
		};

		const animate = () => {
			const now = Date.now();

			if (now - lastGlitchTime >= $.get(current).glitchSpeed) {
				lettersAndSymbols = Array.from($.get(current).characters);
				updateLetters();
				drawLetters();
				lastGlitchTime = now;
			}

			if ($.get(current).smooth) handleSmoothTransitions();

			raf = requestAnimationFrame(animate);
		};

		resizeCanvas();
		animate();

		let resizeTimeout;

		const handleResize = () => {
			clearTimeout(resizeTimeout);

			resizeTimeout = setTimeout(
				() => {
					cancelAnimationFrame(raf);
					resizeCanvas();
					animate();
				},
				100
			);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', handleResize);
		};
	});

	var div = root_2();
	var canvas = $.child(div);

	$.bind_this(canvas, ($$value) => canvasRef = $$value, () => canvasRef);

	var node = $.sibling(canvas, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (outerVignette()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();

			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if (centerVignette()) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}