import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import anime from 'animejs';
import { clamp, mapLinear } from 'three/src/math/MathUtils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'progress',
	'id',
	'in',
	'out',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function TextEffect($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, 'fade'),
		_out = $.prop($$props, 'out', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	let timeline = $.state(void 0);
	let completeDuration = $.state(0);

	const initializeTimeline = () => {
		$.set(timeline, anime.timeline({ autoplay: false }), true);

		if (type() === 'fade-up-skew-individual') {
			// get all letter elements
			$.get(timeline).add({
				targets: `#${$$props.id} .letter`,
				translateY: [30, 0],
				skewY: [10, 0],
				opacity: [0, 1],
				easing: 'easeOutCubic',
				duration: 1000,
				delay: (_el, i) => 50 * (i + 1)
			});
		} else if (type() === 'fade-individual') {
			$.get(timeline).add({
				targets: `#${$$props.id} .letter`,
				opacity: [0, 1],
				easing: 'easeOutCubic',
				duration: 1000,
				delay: (_el, i) => 150 * (i + 1)
			});
		} else if (type() === 'fade') {
			$.get(timeline).add({
				targets: `#${$$props.id} .letter`,
				opacity: [0, 1],
				easing: 'easeOutCubic',
				duration: 1000
			});
		} else if (type() === 'fade-up') {
			$.get(timeline).add({
				targets: `#${$$props.id} .letter`,
				opacity: [0, 1],
				translateY: [5, 0],
				easing: 'easeOutCubic',
				duration: 1000
			});
		}

		$.set(completeDuration, $.get(timeline).duration, true);
		$.set(timeline, $.get(timeline), true);
	};

	const transform = (node) => {
		const originalInnerHTML = node.innerHTML;

		node.innerHTML = node.textContent?.replace(/\S/g, "<span class='letter' style='display: inline-block'>$&</span>") ?? '';
		initializeTimeline();

		return {
			destroy() {
				$.get(timeline)?.pause();
				$.set(timeline, undefined);
				node.innerHTML = originalInnerHTML;
			}
		};
	};

	$.user_effect(() => {
		if ($.get(timeline)) $.get(timeline).seek(clamp(mapLinear($$props.progress, $$props.in.start, $$props.in.end, 0, $.get(completeDuration)), 0, $.get(completeDuration)));
	});

	let opacity = $.derived(() => _out()
		? clamp(mapLinear($$props.progress, _out().start, _out().end, 1, 0), 0, 1)
		: 1);

	var div = root();

	$.attribute_effect(div, () => ({
		id: $$props.id,
		...rest,
		style: `opacity: ${$.get(opacity) ?? ''}`
	}));

	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div);
	$.action(div, ($$node) => transform?.($$node));
	$.append($$anchor, div);
	$.pop();
}