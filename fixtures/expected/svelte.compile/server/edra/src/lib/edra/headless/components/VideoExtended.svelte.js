import * as $ from 'svelte/internal/server';
import MediaExtended from './MediaExtended.svelte';

export default function VideoExtended($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...rest } = $$props;
		let mediaRef = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MediaExtended($$renderer, $.spread_props([
				rest,
				{
					get mediaRef() {
						return mediaRef;
					},

					set mediaRef($$value) {
						mediaRef = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						const node = rest.node;

						$$renderer.push(`<video preload="none"${$.attr('src', node.attrs.src)} playsinline="" controls=""${$.attr('title', node.attrs.title)} class="video-custom svelte-1l1pelt"></video>`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}