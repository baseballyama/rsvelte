import * as $ from 'svelte/internal/server';
import { setup } from '../../../../setup.js';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children } = $$props;

		setup();
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}