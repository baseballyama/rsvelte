import * as $ from 'svelte/internal/server';
import { Button } from "flowbite-svelte";

export default function Events($$renderer) {
	const btn1 = () => {
		alert("You clicked btn1.");
	};

	const btn2 = () => {
		alert("You touched btn2.");
	};

	Button($$renderer, {
		onclick: btn1,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button 1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		ontouchstart: btn2,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button 2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}