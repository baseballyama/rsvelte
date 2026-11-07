import * as $ from 'svelte/internal/server';
import { getAbortSignal } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let aborted = 0;
		let count = 0;

		let der = $.derived(() => {
			const signal = getAbortSignal();

			signal.addEventListener("abort", () => {
				try {
					aborted++;
				} catch(e) {
					console.error(e);
				}
			});

			return count;
		});

		$$renderer.push(`<!---->${$.escape(der())}:${$.escape(aborted)} <button></button>`);
	});
}