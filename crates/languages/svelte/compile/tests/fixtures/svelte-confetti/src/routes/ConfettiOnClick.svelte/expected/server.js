import * as $ from 'svelte/internal/server';
import Confetti from "$lib/Confetti.svelte";

export default function ConfettiOnClick($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const duration = 2000;
		let things = [];
		let timeout;

		async function moveConfetti(event) {
			const { target, clientX, clientY } = event;
			const elementY = target.getBoundingClientRect().top;
			const elementX = target.getBoundingClientRect().left;
			const x = clientX - elementX;
			const y = clientY - elementY;

			things = [...things, { x, y }];
			clearTimeout(timeout);
			timeout = setTimeout(() => things = [], duration);
		}

		$$renderer.push(`<div class="box svelte-1soaze9"><span class="svelte-1soaze9">Click in me</span> <!--[-->`);

		const each_array = $.ensure_array_like(things);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let thing = each_array[$$index];

			$$renderer.push(`<div class="mover svelte-1soaze9"${$.attr_style(`left: ${$.stringify(thing.x)}px; top: ${$.stringify(thing.y)}px`)}>`);
			Confetti($$renderer, { y: [-0.5, 0.5], fallDistance: '20px', amount: '10', duration });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}