import * as $ from 'svelte/internal/server';
import { DocPage } from "@svecodocs/kit";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const ogUrl = $.derived(() => `https://runed.dev/og?title=${encodeURIComponent(data.metadata.title)}&description=${encodeURIComponent(data.metadata.description)}`);

		$.head('5dqvvw', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data.metadata.title)}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', data.metadata.description)}/>`);
		});

		DocPage($$renderer, $.spread_props([
			{ component: data.component },
			data.metadata,
			{
				metadata: { ogImage: { url: ogUrl(), width: "1200", height: "630" } }
			}
		]));
	});
}