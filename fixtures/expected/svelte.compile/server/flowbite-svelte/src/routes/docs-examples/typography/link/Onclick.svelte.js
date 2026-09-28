import * as $ from 'svelte/internal/server';
import { A } from "flowbite-svelte";

export default function Onclick($$renderer) {
	const myaction = () => {
		console.log("Action triggered");
	};

	A($$renderer, {
		href: '/',
		onclick: myaction,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Read more`);
		},
		$$slots: { default: true }
	});
}