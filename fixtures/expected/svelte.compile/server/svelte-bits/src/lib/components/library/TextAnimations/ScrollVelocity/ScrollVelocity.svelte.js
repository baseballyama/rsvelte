import * as $ from 'svelte/internal/server';

export default function ScrollVelocity($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			scrollContainer = null,
			texts = [],
			velocity = 100,
			class: className = '',
			damping = 50,
			stiffness = 400,
			numCopies = 6,
			velocityMapping = { input: [0, 1000], output: [0, 5] },
			parallaxClass = 'parallax',
			scrollerClass = 'scroller',
			parallaxStyle = '',
			scrollerStyle = ''
		} = $$props;

		let copyEls = [];
		let scrollerEls = [];

		function wrap(min, max, v) {
			const range = max - min;
			const mod = ((v - min) % range + range) % range;

			return mod + min;
		}

		$$renderer.push(`<section class="svelte-185a7au"><!--[-->`);

		const each_array = $.ensure_array_like(texts);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let text = each_array[i];

			$$renderer.push(`<div${$.attr_class($.clsx(parallaxClass))}${$.attr_style(parallaxStyle)}><div${$.attr_class($.clsx(scrollerClass))}${$.attr_style(scrollerStyle)}><!--[-->`);

			const each_array_1 = $.ensure_array_like(Array.from({ length: Math.max(numCopies, 1) }, (_, j) => j));

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let j = each_array_1[$$index];

				if (j === 0) {
					$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(className))}>${$.escape(text)} </span>`);
				} else {
					$$renderer.push(`<!--[-1--><span${$.attr_class($.clsx(className))}>${$.escape(text)} </span>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></section>`);
	});
}