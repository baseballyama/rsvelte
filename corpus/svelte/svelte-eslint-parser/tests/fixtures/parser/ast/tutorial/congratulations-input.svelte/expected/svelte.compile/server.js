import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Congratulations_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let characters = ['🥳', '🎉', '✨'];

		let confetti = new Array(100).fill().map((_, i) => {
			return {
				character: characters[i % characters.length],
				x: Math.random() * 100,
				y: -20 - Math.random() * 100,
				r: 0.1 + Math.random() * 1
			};
		}).sort((a, b) => a.r - b.r);

		onMount(() => {
			let frame;

			function loop() {
				frame = requestAnimationFrame(loop);

				confetti = confetti.map((emoji) => {
					emoji.y += 0.7 * emoji.r;

					if (emoji.y > 120) emoji.y = -20;

					return emoji;
				});
			}

			loop();

			return () => cancelAnimationFrame(frame);
		});

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(confetti);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let c = each_array[$$index];

			$$renderer.push(`<span${$.attr_style(`left: ${$.stringify(c.x)}%; top: ${$.stringify(c.y)}%; transform: scale(${$.stringify(c.r)})`)} class="svelte-oy26ul">${$.escape(c.character)}</span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}