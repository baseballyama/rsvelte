import * as $ from 'svelte/internal/server';
import { Progressradial, Button } from "flowbite-svelte";
import { sineOut } from "svelte/easing";

export default function Progressradial_1($$renderer) {
	let progress = 45;

	Progressradial($$renderer, {
		progress,
		animate: true,
		precision: 1,
		labelOutside: 'Animation',
		labelInside: true,
		tweenDuration: 1000,
		easing: sineOut
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => progress = Math.round(Math.random() * 100),
		class: 'mx-auto mt-8 w-24',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Randomize`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}