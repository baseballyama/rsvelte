import * as $ from 'svelte/internal/server';
import { Heading } from "$lib";
import { h2Cls } from "./theme";

export default function H2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className } = $$props;
		const base = $.derived(() => h2Cls({ className }));

		Heading($$renderer, {
			tag: 'h2',
			class: base(),
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}