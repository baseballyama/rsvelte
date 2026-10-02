import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";

var root = $.from_html(`<div class="confetti svelte-1l3pvrr"></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function Confetti($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {number} [size] The maximum size of each confetti piece, each piece will randomly be given a size up to this number
	 * @property {[number, number]} [x] The X multiplier of the distance between which the pieces will fly horizontally
	 * @property {[number, number]} [y] The Y multiplier of the distance between which the pieces will fly vertically
	 * @property {number} [duration] The total duration of the animation in milliseconds
	 * @property {boolean} [infinite] Whether the effect should loop infinitely
	 * @property {[number, number]} [delay] Range of random delay between two values, in milliseconds, which will be randomly given to each piece
	 * @property {[number, number]} [colorRange] Hue color range between which the confetti will be colored
	 * @property {string[]} [colorArray] An array of colors in any valid CSS value, colors will be asigned to each piece randomly from this array
	 * @property {number} [amount] The amount of confetti pieces in total, high numbers might lead to performance issues
	 * @property {number | "infinite" | "initial" | "inherit"} [iterationCount] The number of times the animation will fire, allows any value valid for the css prop `animation-iteration-count`
	 * @property {string} [fallDistance] The distance elements fall, represented as a css value such as "10px" or "5rem"
	 * @property {boolean} [rounded] Whether the confetti pieces should have rounded edges
	 * @property {boolean} [cone] Whether the effect should be shaped like a cone, rather than more box-shaped
	 * @property {boolean} [noGravity] Whether gravity should be disabled for the effect
	 * @property {number} [xSpread] The horizontal spread of the effect as it falls down, from 0 to 1
	 * @property {boolean} [destroyOnComplete] Whether to destroy the elements after the animation is complete
	 * @property {boolean} [disableForReducedMotion] Disable the effect if reduced motion is enabled
	 */
	/** @type {Props} */
	const size = $.prop($$props, 'size', 3, 10),
		x = $.prop($$props, 'x', 19, () => [-0.5, 0.5]),
		y = $.prop($$props, 'y', 19, () => [0.25, 1]),
		duration = $.prop($$props, 'duration', 3, 2000),
		infinite = $.prop($$props, 'infinite', 3, false),
		delay = $.prop($$props, 'delay', 19, () => [0, 50]),
		colorRange = $.prop($$props, 'colorRange', 19, () => [0, 360]),
		colorArray = $.prop($$props, 'colorArray', 19, () => []),
		amount = $.prop($$props, 'amount', 3, 50),
		iterationCount = $.prop($$props, 'iterationCount', 3, 1),
		fallDistance = $.prop($$props, 'fallDistance', 3, "100px"),
		rounded = $.prop($$props, 'rounded', 3, false),
		cone = $.prop($$props, 'cone', 3, false),
		noGravity = $.prop($$props, 'noGravity', 3, false),
		xSpread = $.prop($$props, 'xSpread', 3, 0.15),
		destroyOnComplete = $.prop($$props, 'destroyOnComplete', 3, true),
		disableForReducedMotion = $.prop($$props, 'disableForReducedMotion', 3, false);

	let complete = $.state(false);

	onMount(() => {
		if (!destroyOnComplete() || infinite() || typeof iterationCount() === "string") return;

		setTimeout(() => $.set(complete, true), (duration() + delay()[1]) * iterationCount());
	});

	/**
		 * @param {number} min
		 * @param {number} max
	 * @returns {number}
		 */
	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	/** @returns {string} */
	function getColor() {
		if (colorArray().length) return colorArray()[Math.round(Math.random() * (colorArray().length - 1))]; else return `hsl(${Math.round(randomBetween(colorRange()[0], colorRange()[1]))}, 75%, 50%)`;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			let classes;

			$.each(div, 21, () => ({ length: amount() }), $.index, ($$anchor, _) => {
				var div_1 = root();

				$.template_effect(
					($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) => $.set_style(div_1, `
        --color: ${$0 ?? ''};
        --skew: ${$1 ?? ''}deg,${$2 ?? ''}deg;
        --rotation-xyz: ${$3 ?? ''}, ${$4 ?? ''}, ${$5 ?? ''};
        --rotation-deg: ${$6 ?? ''}deg;
        --translate-y-multiplier: ${$7 ?? ''};
        --translate-x-multiplier: ${$8 ?? ''};
        --scale: ${$9 ?? ''};
        --transition-delay: ${$10 ?? ''}ms;
        --transition-duration: ${infinite()
						? `calc(${duration()}ms * var(--scale))`
						: `${duration()}ms`};`),
					[
						() => getColor(),
						() => randomBetween(-45, 45),
						() => randomBetween(-45, 45),
						() => randomBetween(-10, 10),
						() => randomBetween(-10, 10),
						() => randomBetween(-10, 10),
						() => randomBetween(0, 360),
						() => randomBetween(y()[0], y()[1]),
						() => randomBetween(x()[0], x()[1]),
						() => 0.1 * randomBetween(2, 10),
						() => randomBetween(delay()[0], delay()[1])
					]
				);

				$.append($$anchor, div_1);
			});

			$.reset(div);

			$.template_effect(() => {
				classes = $.set_class(div, 1, 'confetti-holder svelte-1l3pvrr', null, classes, {
					rounded: rounded(),
					cone: cone(),
					'no-gravity': noGravity(),
					'reduced-motion': disableForReducedMotion()
				});

				$.set_style(div, `
    --fall-distance: ${fallDistance() ?? ''};
    --size: ${size() ?? ''}px;
    --x-spread: ${1 - xSpread()};
    --transition-iteration-count: ${(infinite() ? "infinite" : iterationCount()) ?? ''};`);
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (!$.get(complete)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}