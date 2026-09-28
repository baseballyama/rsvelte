import * as $ from 'svelte/internal/server';
import { LoadingPlaceholder } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;

		$$renderer.push(`<h1 class="text-3xl font-bold mb-2">${$.escape(data.metadata.title)}</h1> <div class="mb-4">`);
		OpenWithButton($$renderer, {});
		$$renderer.push(`<!----></div> `);
		$$renderer.push(`<!--[!-->`);

		{
			LoadingPlaceholder($$renderer, {});
		}

		$$renderer.push(`<!--]-->`);
	});
}