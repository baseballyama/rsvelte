import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function WhitespaceNowrap($$renderer) {
	P($$renderer, {
		whitespace: 'nowrap',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.`);
		},
		$$slots: { default: true }
	});
}