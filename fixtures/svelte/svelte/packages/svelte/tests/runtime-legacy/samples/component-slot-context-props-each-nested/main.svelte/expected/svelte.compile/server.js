import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { set, key, item }) => {
				$$renderer.push(`<button type="button">Set ${$.escape(key)}-${$.escape(item)}</button>`);
			}
		}
	});
}