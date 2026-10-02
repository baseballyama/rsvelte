import * as $ from 'svelte/internal/server';
import tippy from 'tippy.js';
import Button from './Button.svelte';

export default function Attach04_ts_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let content = 'Hello!';

		function tooltip(content) {
			return (element) => {
				const tooltip = tippy(element, { content });

				return tooltip.destroy;
			};
		}

		$$renderer.push(`<input${$.attr('value', content)}/> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Hover me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}