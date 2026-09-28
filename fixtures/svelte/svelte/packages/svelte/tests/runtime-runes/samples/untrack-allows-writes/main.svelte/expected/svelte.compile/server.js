import * as $ from 'svelte/internal/server';
import { untrack } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let mirrored = 0;

		let double = $.derived(() => {
			untrack(() => {
				mirrored = count;
			});

			return count * 2;
		});

		$$renderer.push(`<button>${$.escape(count)} ${$.escape(mirrored)} ${$.escape(double())}</button>`);
	});
}