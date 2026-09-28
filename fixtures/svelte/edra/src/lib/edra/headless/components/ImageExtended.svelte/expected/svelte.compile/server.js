import * as $ from 'svelte/internal/server';
import MediaExtended from './MediaExtended.svelte';

export default function ImageExtended($$renderer, $$props) {
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

						$$renderer.push(`<img${$.attr('src', node.attrs.src)}${$.attr('alt', node.attrs.alt)}${$.attr('title', node.attrs.title)} class="img-custom svelte-1fn7yhb"/>`);
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