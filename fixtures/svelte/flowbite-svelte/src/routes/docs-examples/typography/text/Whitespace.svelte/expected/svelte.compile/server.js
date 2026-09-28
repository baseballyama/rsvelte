import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function Whitespace($$renderer) {
	P($$renderer, {
		whitespace: 'normal',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		whitespace: 'nowrap',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		whitespace: 'preline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}