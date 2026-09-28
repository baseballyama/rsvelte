import * as $ from 'svelte/internal/server';
import { Label } from 'attractions';

export default function Th($$renderer, $$props) {
	$$renderer.push(`<th>`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, 'default', {}, null);
			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></th>`);
}