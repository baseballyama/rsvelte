import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function C($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let greeting = getContext("greeting");
		let recipient = getContext("recipient");

		$$renderer.push(`<p>${$.escape(greeting)} ${$.escape(recipient)}</p>`);
	});
}