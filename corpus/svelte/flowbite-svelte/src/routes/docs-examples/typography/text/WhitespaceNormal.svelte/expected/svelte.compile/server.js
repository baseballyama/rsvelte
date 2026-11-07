import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function WhitespaceNormal($$renderer) {
	P($$renderer, {
		whitespace: 'normal',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text. This is some text.`);
		},
		$$slots: { default: true }
	});
}