import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

function parseHSL(hslStr) {
	const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);

	if (!match) return { h: 40, s: 80, l: 80 };

	return {
		h: parseFloat(match[1]),
		s: parseFloat(match[2]),
		l: parseFloat(match[3])
	};
}

export function buildBoxShadow(glowColor, intensity) {
	const { h, s, l } = parseHSL(glowColor);
	const base = `${h}deg ${s}% ${l}%`;

	const layers = [
		[0, 0, 0, 1, 100, true],
		[0, 0, 1, 0, 60, true],
		[0, 0, 3, 0, 50, true],
		[0, 0, 6, 0, 40, true],
		[0, 0, 15, 0, 30, true],
		[0, 0, 25, 2, 20, true],
		[0, 0, 50, 2, 10, true],
		[0, 0, 1, 0, 60, false],
		[0, 0, 3, 0, 50, false],
		[0, 0, 6, 0, 40, false],
		[0, 0, 15, 0, 30, false],
		[0, 0, 25, 2, 20, false],
		[0, 0, 50, 2, 10, false]
	];

	return layers.map(([x, y, blur, spread, alpha, inset]) => {
		const a = Math.min(alpha * intensity, 100);

		return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
	}).join(', ');
}

export function easeOutCubic(x) {
	return 1 - Math.pow(1 - x, 3);
}

export function easeInCubic(x) {
	return x * x * x;
}

const GRADIENT_POSITIONS = [
	'80% 55%',
	'69% 34%',
	'8% 6%',
	'41% 38%',
	'86% 85%',
	'82% 18%',
	'51% 4%'
];

const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

export function buildMeshGradients(colors) {
	const out = [];

	for (let i = 0; i < 7; i++) {
		const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];

		out.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
	}

	out.push(`linear-gradient(${colors[0]} 0 100%)`);

	return out;
}

var root = $.from_html(`<div role="presentation"><div class="absolute inset-0 -z-[1]"></div> <div class="absolute inset-0 -z-[1]"></div> <span class="absolute pointer-events-none z-[1]"><span class="absolute"></span></span> <div class="flex flex-col relative overflow-auto z-[1]"><!></div></div>`);

export default function BorderGlow($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		edgeSensitivity = $.prop($$props, 'edgeSensitivity', 3, 30),
		glowColor = $.prop($$props, 'glowColor', 3, '40 80 80'),
		backgroundColor = $.prop($$props, 'backgroundColor', 3, '#14110E'),
		borderRadius = $.prop($$props, 'borderRadius', 3, 28),
		glowRadius = $.prop($$props, 'glowRadius', 3, 40),
		glowIntensity = $.prop($$props, 'glowIntensity', 3, 1.0),
		coneSpread = $.prop($$props, 'coneSpread', 3, 25),
		animated = $.prop($$props, 'animated', 3, false),
		colors = $.prop($$props, 'colors', 19, () => ['#FF8A4C', '#FFC18A', '#FF6B2C']),
		fillOpacity = $.prop($$props, 'fillOpacity', 3, 0.5);

	let cardRef;
	let isHovered = $.state(false);
	let cursorAngle = $.state(45);
	let edgeProximity = $.state(0);
	let sweepActive = $.state(false);

	function getCenterOf(el) {
		const { width, height } = el.getBoundingClientRect();

		return [width / 2, height / 2];
	}

	function getEdgeProximity(el, x, y) {
		const [cx, cy] = getCenterOf(el);
		const dx = x - cx;
		const dy = y - cy;
		let kx = Infinity, ky = Infinity;

		if (dx !== 0) kx = cx / Math.abs(dx);
		if (dy !== 0) ky = cy / Math.abs(dy);

		return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
	}

	function getCursorAngle(el, x, y) {
		const [cx, cy] = getCenterOf(el);
		const dx = x - cx;
		const dy = y - cy;

		if (dx === 0 && dy === 0) return 0;

		const radians = Math.atan2(dy, dx);
		let degrees = radians * (180 / Math.PI) + 90;

		if (degrees < 0) degrees += 360;

		return degrees;
	}

	function handlePointerMove(e) {
		if (!cardRef) return;

		const rect = cardRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		$.set(edgeProximity, getEdgeProximity(cardRef, x, y), true);
		$.set(cursorAngle, getCursorAngle(cardRef, x, y), true);
	}

	function animateValue(
		{
			start = 0,
			end = 100,
			duration = 1000,
			delay = 0,
			ease = easeOutCubic,
			onUpdate,
			onEnd
		}
	) {
		const t0 = performance.now() + delay;

		function tick() {
			const elapsed = performance.now() - t0;
			const t = Math.min(Math.max(elapsed / duration, 0), 1);

			onUpdate(start + (end - start) * ease(t));

			if (t < 1) requestAnimationFrame(tick); else onEnd?.();
		}

		setTimeout(() => requestAnimationFrame(tick), delay);
	}

	onMount(() => {
		if (!animated()) return;

		const angleStart = 110;
		const angleEnd = 465;

		$.set(sweepActive, true);
		$.set(cursorAngle, angleStart);

		animateValue({
			duration: 500,
			onUpdate: (v) => $.set(edgeProximity, v / 100)
		});

		animateValue({
			ease: easeInCubic,
			duration: 1500,
			end: 50,
			onUpdate: (v) => $.set(cursorAngle, (angleEnd - angleStart) * (v / 100) + angleStart)
		});

		animateValue({
			ease: easeOutCubic,
			delay: 1500,
			duration: 2250,
			start: 50,
			end: 100,
			onUpdate: (v) => $.set(cursorAngle, (angleEnd - angleStart) * (v / 100) + angleStart)
		});

		animateValue({
			ease: easeInCubic,
			delay: 2500,
			duration: 1500,
			start: 100,
			end: 0,
			onUpdate: (v) => $.set(edgeProximity, v / 100),
			onEnd: () => $.set(sweepActive, false)
		});
	});

	const colorSensitivity = $.derived(() => edgeSensitivity() + 20);
	const isVisible = $.derived(() => $.get(isHovered) || $.get(sweepActive));

	const borderOpacity = $.derived(() => $.get(isVisible)
		? Math.max(0, ($.get(edgeProximity) * 100 - $.get(colorSensitivity)) / (100 - $.get(colorSensitivity)))
		: 0);

	const glowOpacity = $.derived(() => $.get(isVisible)
		? Math.max(0, ($.get(edgeProximity) * 100 - edgeSensitivity()) / (100 - edgeSensitivity()))
		: 0);

	const meshGradients = $.derived(() => buildMeshGradients(colors()));
	const borderBg = $.derived(() => $.get(meshGradients).map((g) => `${g} border-box`));
	const fillBg = $.derived(() => $.get(meshGradients).map((g) => `${g} padding-box`));
	const angleDeg = $.derived(() => `${$.get(cursorAngle).toFixed(3)}deg`);

	const transitionStr = $.derived(() => $.get(isVisible)
		? 'opacity 0.25s ease-out'
		: 'opacity 0.75s ease-in-out');

	const borderMask = $.derived(() => `conic-gradient(from ${$.get(angleDeg)} at center, black ${coneSpread()}%, transparent ${coneSpread() + 15}%, transparent ${100 - coneSpread() - 15}%, black ${100 - coneSpread()}%)`);

	const fillMask = $.derived(() => [
		'linear-gradient(to bottom, black, black)',
		'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
		'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
		'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
		'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
		'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
		`conic-gradient(from ${$.get(angleDeg)} at center, transparent 5%, black 15%, black 85%, transparent 95%)`
	].join(', '));

	const outerMask = $.derived(() => `conic-gradient(from ${$.get(angleDeg)} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`);

	const borderBgFull = $.derived(() => [
		`linear-gradient(${backgroundColor()} 0 100%) padding-box`,
		'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
		...$.get(borderBg)
	].join(', '));

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var span = $.sibling(div_2, 2);
	var span_1 = $.only_child(span);
	var div_3 = $.sibling(span, 2);
	var node = $.child(div_3);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_3);
	$.reset(div);
	$.bind_this(div, ($$value) => cardRef = $$value, () => cardRef);

	$.template_effect(
		($0, $1) => {
			$.set_class(div, 1, `relative grid isolate border border-white/15 ${className() ?? ''}`);
			$.set_style(div, `background:${backgroundColor() ?? ''}; border-radius:${borderRadius() ?? ''}px; transform:translate3d(0,0,0.01px); box-shadow: rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px, rgba(0,0,0,0.1) 0 16px 32px, rgba(0,0,0,0.1) 0 32px 64px;`);
			$.set_style(div_1, `border-radius:inherit; border:1px solid transparent; background:${$.get(borderBgFull) ?? ''}; opacity:${$.get(borderOpacity) ?? ''}; -webkit-mask-image:${$.get(borderMask) ?? ''}; mask-image:${$.get(borderMask) ?? ''}; transition:${$.get(transitionStr) ?? ''};`);
			$.set_style(div_2, `border-radius:inherit; border:1px solid transparent; background:${$0 ?? ''}; -webkit-mask-image:${$.get(fillMask) ?? ''}; mask-image:${$.get(fillMask) ?? ''}; -webkit-mask-composite: source-out, source-over, source-over, source-over, source-over, source-over; mask-composite: subtract, add, add, add, add, add; opacity:${$.get(borderOpacity) * fillOpacity()}; mix-blend-mode: soft-light; transition:${$.get(transitionStr) ?? ''};`);
			$.set_style(span, `border-radius:inherit; inset:${-glowRadius()}px; -webkit-mask-image:${$.get(outerMask) ?? ''}; mask-image:${$.get(outerMask) ?? ''}; opacity:${$.get(glowOpacity) ?? ''}; mix-blend-mode: plus-lighter; transition:${$.get(transitionStr) ?? ''};`);
			$.set_style(span_1, `border-radius:inherit; inset:${glowRadius() ?? ''}px; box-shadow:${$1 ?? ''};`);
		},
		[
			() => $.get(fillBg).join(', '),
			() => buildBoxShadow(glowColor(), glowIntensity())
		]
	);

	$.delegated('pointermove', div, handlePointerMove);
	$.event('pointerenter', div, () => $.set(isHovered, true));
	$.event('pointerleave', div, () => $.set(isHovered, false));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['pointermove']);