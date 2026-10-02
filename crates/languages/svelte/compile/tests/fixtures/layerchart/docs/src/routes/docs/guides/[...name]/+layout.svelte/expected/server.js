import * as $ from 'svelte/internal/server';
import { LoadingPlaceholder } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';
import { examples } from '@layerstack/docs/context';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;

		// Override examples context with guide-specific examples loaded by +layout.ts
		const examplesContext = {
			get current() {
				return data.examples ?? {};
			}
		};

		examples.set(examplesContext);
		$$renderer.push(`<h1 class="text-3xl font-bold mb-2">${$.escape(data.metadata.title)}</h1> `);

		if (data.metadata.title !== 'LLMs') {
			$$renderer.push(`<!--[0--><div class="mb-4">`);
			OpenWithButton($$renderer, { example: data.metadata.title === 'LLMs' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		$$renderer.push(`<!--[!-->`);

		{
			LoadingPlaceholder($$renderer, {});
		}

		$$renderer.push(`<!--]-->`);
	});
}