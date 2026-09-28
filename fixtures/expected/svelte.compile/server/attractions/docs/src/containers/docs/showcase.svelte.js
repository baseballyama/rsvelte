import * as $ from 'svelte/internal/server';
import { Label } from 'attractions';
import CopyableCode from 'src/components/docs/copyable-code.svelte';

export default function Showcase($$renderer, $$props) {
	$$renderer.push(`<section class="showcase">`);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Showcase`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <!--[-->`);
	$.slot($$renderer, $$props, 'showcase', {}, null);
	$$renderer.push(`<!--]--> `);

	Label($$renderer, {
		class: 'code',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Source`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	CopyableCode($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, 'source', {}, null);
			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}