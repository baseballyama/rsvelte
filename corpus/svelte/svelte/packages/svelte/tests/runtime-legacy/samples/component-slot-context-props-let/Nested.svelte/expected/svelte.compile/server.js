import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

export default function Nested($$renderer, $$props) {
	Inner($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { key, set }) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'default', { key, set: (value) => set(key, value) }, null);
				$$renderer.push(`<!--]-->`);
			}
		}
	});
}