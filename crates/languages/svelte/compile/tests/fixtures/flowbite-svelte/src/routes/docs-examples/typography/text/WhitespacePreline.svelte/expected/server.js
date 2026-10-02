import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function WhitespacePreline($$renderer) {
	P($$renderer, {
		whitespace: 'preline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.`);
		},
		$$slots: { default: true }
	});
}