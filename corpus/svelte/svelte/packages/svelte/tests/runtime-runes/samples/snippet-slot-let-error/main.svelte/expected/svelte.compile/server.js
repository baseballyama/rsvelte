import * as $ from 'svelte/internal/server';
import Inner from './inner.svelte';

export default function Main($$renderer) {
	Inner($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo }) => {
				$$renderer.push(`<!---->${$.escape(foo)}`);
			}
		}
	});
}