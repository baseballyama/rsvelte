import * as $ from 'svelte/internal/server';
import { Heading } from "flowbite-svelte";
import { h1Cls } from "./theme";

export default function H1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className } = $$props;
		const base = $.derived(() => h1Cls({ className }));

		Heading($$renderer, {
			tag: 'h1',
			class: base(),
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}