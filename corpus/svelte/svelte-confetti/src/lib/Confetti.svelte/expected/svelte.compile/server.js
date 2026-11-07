import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";

export default function Confetti($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		const {
			size = 10,
			x = [-0.5, 0.5],
			y = [0.25, 1],
			duration = 2000,
			infinite = false,
			delay = [0, 50],
			colorRange = [0, 360],
			colorArray = [],
			amount = 50,
			iterationCount = 1,
			fallDistance = "100px",
			rounded = false,
			cone = false,
			noGravity = false,
			xSpread = 0.15,
			destroyOnComplete = true,
			disableForReducedMotion = false
		} = $$props;

		let complete = false;

		onMount(() => {
			if (!destroyOnComplete || infinite || typeof iterationCount === "string") return;

			setTimeout(() => complete = true, (duration + delay[1]) * iterationCount);
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
			if (colorArray.length) return colorArray[Math.round(Math.random() * (colorArray.length - 1))]; else return `hsl(${Math.round(randomBetween(colorRange[0], colorRange[1]))}, 75%, 50%)`;
		}

		if (!complete) {
			$$renderer.push(`<!--[0--><div${$.attr_class('confetti-holder svelte-1l3pvrr', void 0, {
				'rounded': rounded,
				'cone': cone,
				'no-gravity': noGravity,
				'reduced-motion': disableForReducedMotion
			})}${$.attr_style(` --fall-distance: ${$.stringify(fallDistance)}; --size: ${$.stringify(size)}px; --x-spread: ${$.stringify(1 - xSpread)}; --transition-iteration-count: ${$.stringify(infinite ? "infinite" : iterationCount)};`)}><!--[-->`);

			const each_array = $.ensure_array_like({ length: amount });

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let _ = each_array[$$index];

				$$renderer.push(`<div class="confetti svelte-1l3pvrr"${$.attr_style(` --color: ${$.stringify(getColor())}; --skew: ${$.stringify(randomBetween(-45, 45))}deg,${$.stringify(randomBetween(-45, 45))}deg; --rotation-xyz: ${$.stringify(randomBetween(-10, 10))}, ${$.stringify(randomBetween(-10, 10))}, ${$.stringify(randomBetween(-10, 10))}; --rotation-deg: ${$.stringify(randomBetween(0, 360))}deg; --translate-y-multiplier: ${$.stringify(randomBetween(y[0], y[1]))}; --translate-x-multiplier: ${$.stringify(randomBetween(x[0], x[1]))}; --scale: ${$.stringify(0.1 * randomBetween(2, 10))}; --transition-delay: ${$.stringify(randomBetween(delay[0], delay[1]))}ms; --transition-duration: ${infinite
					? `calc(${duration}ms * var(--scale))`
					: `${duration}ms`};`)}></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}