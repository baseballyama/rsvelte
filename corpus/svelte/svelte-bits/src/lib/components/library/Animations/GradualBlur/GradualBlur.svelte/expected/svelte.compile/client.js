import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const PRESETS = {
	top: { position: 'top', height: '6rem' },
	bottom: { position: 'bottom', height: '6rem' },
	left: { position: 'left', height: '6rem' },
	right: { position: 'right', height: '6rem' },
	subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
	intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
	smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
	sharp: { height: '5rem', curve: 'linear', divCount: 4 },
	header: { position: 'top', height: '8rem', curve: 'ease-out' },
	footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
	sidebar: { position: 'left', height: '6rem', strength: 2.5 },
	'page-header': {
		position: 'top',
		height: '10rem',
		target: 'page',
		strength: 3
	},
	'page-footer': {
		position: 'bottom',
		height: '10rem',
		target: 'page',
		strength: 3
	}
};

const CURVE_FUNCTIONS = {
	linear: (p) => p,
	bezier: (p) => p * p * (3 - 2 * p),
	'ease-in': (p) => p * p,
	'ease-out': (p) => 1 - Math.pow(1 - p, 2),
	'ease-in-out': (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
};

function gradientDir(pos) {
	return ({
		top: 'to top',
		bottom: 'to bottom',
		left: 'to left',
		right: 'to right'
	})[pos];
}

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div class="absolute inset-0"></div>`);
var root_1 = $.from_html(`<div class="relative"><!></div>`);
var root_2 = $.from_html(`<div role="presentation"><div class="relative w-full h-full"></div> <!></div>`);

export default function GradualBlur($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	const cfg = $.derived(() => {
		const presetCfg = $$props.preset ? PRESETS[$$props.preset] : {};

		return {
			position: 'bottom',
			strength: 2,
			height: '6rem',
			width: undefined,
			divCount: 5,
			exponential: false,
			zIndex: 1000,
			animated: false,
			duration: '0.3s',
			easing: 'ease-out',
			opacity: 1,
			curve: 'linear',
			hoverIntensity: undefined,
			target: 'parent',
			...presetCfg,
			...Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined))
		};
	});

	let isHovered = $.state(false);
	let isVisible = $.state(true);
	let containerEl;

	$.user_effect(() => {
		if ($.get(cfg).animated !== 'scroll' || !containerEl) return;

		$.set(isVisible, false);

		const obs = new IntersectionObserver(([entry]) => $.set(isVisible, entry.isIntersecting, true), { threshold: 0.1 });

		obs.observe(containerEl);

		return () => obs.disconnect();
	});

	const divs = $.derived(() => {
		const out = [];
		const inc = 100 / $.get(cfg).divCount;

		const currentStrength = $.get(isHovered) && $.get(cfg).hoverIntensity
			? $.get(cfg).strength * $.get(cfg).hoverIntensity
			: $.get(cfg).strength;

		const curveFn = CURVE_FUNCTIONS[$.get(cfg).curve] || CURVE_FUNCTIONS.linear;

		for (let i = 1; i <= $.get(cfg).divCount; i++) {
			let progress = i / $.get(cfg).divCount;

			progress = curveFn(progress);

			const blur = $.get(cfg).exponential
				? Math.pow(2, progress * 4) * 0.0625 * currentStrength
				: 0.0625 * (progress * $.get(cfg).divCount + 1) * currentStrength;

			const p1 = Math.round((inc * i - inc) * 10) / 10;
			const p2 = Math.round(inc * i * 10) / 10;
			const p3 = Math.round((inc * i + inc) * 10) / 10;
			const p4 = Math.round((inc * i + inc * 2) * 10) / 10;
			let grad = `transparent ${p1}%, black ${p2}%`;

			if (p3 <= 100) grad += `, black ${p3}%`;
			if (p4 <= 100) grad += `, transparent ${p4}%`;

			const dir = gradientDir($.get(cfg).position);

			const transition = $.get(cfg).animated && $.get(cfg).animated !== 'scroll'
				? `backdrop-filter ${$.get(cfg).duration} ${$.get(cfg).easing}`
				: '';

			out.push({
				style: `mask-image:linear-gradient(${dir}, ${grad});-webkit-mask-image:linear-gradient(${dir}, ${grad});backdrop-filter:blur(${blur.toFixed(3)}rem);-webkit-backdrop-filter:blur(${blur.toFixed(3)}rem);opacity:${$.get(cfg).opacity};${transition ? `transition:${transition};` : ''}`
			});
		}

		return out;
	});

	const containerStyle = $.derived(() => {
		const isVertical = $.get(cfg).position === 'top' || $.get(cfg).position === 'bottom';
		const isPage = $.get(cfg).target === 'page';

		const parts = [
			`position:${isPage ? 'fixed' : 'absolute'}`,
			`pointer-events:${$.get(cfg).hoverIntensity ? 'auto' : 'none'}`,
			`opacity:${$.get(isVisible) ? 1 : 0}`,
			`z-index:${isPage ? $.get(cfg).zIndex + 100 : $.get(cfg).zIndex}`
		];

		if ($.get(cfg).animated) parts.push(`transition:opacity ${$.get(cfg).duration} ${$.get(cfg).easing}`);

		if (isVertical) {
			parts.push(`height:${$.get(cfg).height}`);
			parts.push(`width:${$.get(cfg).width || '100%'}`);
			parts.push(`${$.get(cfg).position}:0`, 'left:0', 'right:0');
		} else {
			parts.push(`width:${$.get(cfg).width || $.get(cfg).height}`);
			parts.push('height:100%');
			parts.push(`${$.get(cfg).position}:0`, 'top:0', 'bottom:0');
		}

		return parts.join(';') + ';' + ($$props.style ?? '');
	});

	var div = root_2();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $.get(divs), $.index, ($$anchor, d) => {
		var div_2 = root();

		$.template_effect(() => $.set_style(div_2, $.get(d).style));
		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root_1();
			var node_1 = $.child(div_3);

			$.snippet(node_1, () => $$props.children);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => containerEl = $$value, () => containerEl);

	$.template_effect(() => {
		$.set_class(div, 1, `gradual-blur relative isolate ${$.get(cfg).target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${$$props.class ?? '' ?? ''}`);
		$.set_style(div, $.get(containerStyle));
	});

	$.event('mouseenter', div, function (...$$args) {
		($.get(cfg).hoverIntensity ? () => $.set(isHovered, true) : undefined)?.apply(this, $$args);
	});

	$.event('mouseleave', div, function (...$$args) {
		($.get(cfg).hoverIntensity ? () => $.set(isHovered, false) : undefined)?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}