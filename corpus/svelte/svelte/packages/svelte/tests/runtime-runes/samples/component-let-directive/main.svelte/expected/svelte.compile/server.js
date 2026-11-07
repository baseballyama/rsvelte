import * as $ from 'svelte/internal/server';
import Counter from "./Counter.svelte";

export default function Main($$renderer) {
	let count = 'not state';

	Counter($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { count }) => {
				$$renderer.push(`<!---->${$.escape(count)}`);
			},

			named: ($$renderer) => {
				$$renderer.push(`<p slot="named">named slot count is not state</p>`);
			}
		}
	});
}