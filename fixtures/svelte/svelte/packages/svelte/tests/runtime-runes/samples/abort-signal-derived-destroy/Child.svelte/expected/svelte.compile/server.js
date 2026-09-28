import * as $ from 'svelte/internal/server';
import { getAbortSignal } from "svelte";

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count, aborted = void 0 } = $$props;

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

		$$renderer.push(`<!---->${$.escape(der())}`);
		$.bind_props($$props, { aborted });
	});
}