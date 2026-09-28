import * as $ from 'svelte/internal/server';
import { Shell } from '$lib/layout';
import Footer from '$lib/layout/footer.svelte';

export default function _layout($$renderer, $$props) {
	Shell($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, 'default', {}, null);
			$$renderer.push(`<!--]-->`);
		},

		$$slots: {
			default: true,
			footer: ($$renderer) => {
				Footer($$renderer, { slot: 'footer' });
			}
		}
	});
}