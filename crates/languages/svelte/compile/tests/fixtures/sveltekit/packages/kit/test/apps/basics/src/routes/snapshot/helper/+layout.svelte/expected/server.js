import * as $ from 'svelte/internal/server';
import { snapshot } from '$app/navigation';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let value = '';

		snapshot({
			id: 'snapshot-helper-layout',
			capture: () => value,
			restore: (snapshot) => value = snapshot,
			reset: () => value = ''
		});

		$$renderer.push(`<label>layout <input data-testid="layout"${$.attr('value', value)}/></label> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}