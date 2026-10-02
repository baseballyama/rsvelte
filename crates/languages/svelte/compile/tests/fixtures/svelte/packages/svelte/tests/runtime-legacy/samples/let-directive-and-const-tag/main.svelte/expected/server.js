import * as $ from 'svelte/internal/server';
import Component from './component.svelte';

export default function Main($$renderer) {
	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { data }) => {
				const thing = data;

				$$renderer.push(`<!---->${$.escape(thing)}`);
			}
		}
	});
}