import * as $ from 'svelte/internal/server';
import { animate } from 'motion';

export default function BlurText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text = '',
			delay = 200,
			class: className = '',
			animateBy = 'words',
			direction = 'top',
			threshold = 0.1,
			rootMargin = '0px',
			animationFrom,
			animationTo,
			easing = (t) => t,
			onAnimationComplete,
			stepDuration = 0.35
		} = $$props;

		const elements = $.derived(() => animateBy === 'words' ? text.split(' ') : text.split(''));
		let inView = false;
		let containerEl = void 0;
		let spanEls = [];

		const defaultFrom = $.derived(() => direction === 'top'
			? { filter: 'blur(10px)', opacity: 0, y: -50 }
			: { filter: 'blur(10px)', opacity: 0, y: 50 });

		const defaultTo = $.derived(() => [
			{
				filter: 'blur(5px)',
				opacity: 0.5,
				y: direction === 'top' ? 5 : -5
			},
			{ filter: 'blur(0px)', opacity: 1, y: 0 }
		]);

		const fromSnapshot = $.derived(() => animationFrom ?? defaultFrom());
		const toSnapshots = $.derived(() => animationTo ?? defaultTo());

		function buildKeyframes(from, steps) {
			const keys = new Set([
				...Object.keys(from),
				...steps.flatMap((s) => Object.keys(s))
			]);

			const out = {};

			keys.forEach((k) => {
				out[k] = [from[k], ...steps.map((s) => s[k])];
			});

			return out;
		}

		function applyInitial(el, snap) {
			const props = {};

			for (const [k, v] of Object.entries(snap)) {
				if (k === 'y') {
					props.transform = `translateY(${typeof v === 'number' ? v + 'px' : v})`;
				} else if (k === 'x') {
					props.transform = `${props.transform ?? ''} translateX(${typeof v === 'number' ? v + 'px' : v})`.trim();
				} else if (k === 'filter') {
					props.filter = String(v);
				} else if (k === 'opacity') {
					props.opacity = String(v);
				} else {
					el.style[k] = String(v);
				}
			}

			if (props.transform) el.style.transform = props.transform;
			if (props.filter !== undefined) el.style.filter = props.filter;
			if (props.opacity !== undefined) el.style.opacity = props.opacity;
		}

		$$renderer.push(`<p${$.attr_class(`blur-text ${$.stringify(
			// Set initial styles immediately on mount
			// re-run when snapshots change
			// Build per-property keyframe arrays with `y` mapped to translateY transform
			className
		)} flex flex-wrap`)}><!--[-->`);

		const each_array = $.ensure_array_like(elements());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let segment = each_array[index];

			$$renderer.push(`<span${$.attr_style('', {
				display: 'inline-block',
				'will-change': 'transform, filter, opacity'
			})}>${$.escape(segment === ' ' ? '\u00A0' : segment)}${$.escape(animateBy === 'words' && index < elements().length - 1 ? '\u00A0' : '')}</span>`);
		}

		$$renderer.push(`<!--]--></p>`);
	});
}