import * as $ from 'svelte/internal/server';
import { setup } from '../../../../setup.js';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setup();
		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}