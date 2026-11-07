import * as $ from 'svelte/internal/server';
import tippy from 'tippy.js';

export default function Attach_ts_02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let content = 'Hello!';

		function tooltip(content) {
			return (element) => {
				const tooltip = tippy(element, { content });

				return tooltip.destroy;
			};
		}

		$$renderer.push(`<input${$.attr('value', content)}/> <button>Hover me</button>`);
	});
}