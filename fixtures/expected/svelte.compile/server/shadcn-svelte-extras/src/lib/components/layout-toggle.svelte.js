import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { UserConfigContext } from '$lib/user-config.svelte.js';
import GalleryHorizontalIcon from '@lucide/svelte/icons/gallery-horizontal';

export default function Layout_toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;
		const userConfig = UserConfigContext.get();

		Button($$renderer, $.spread_props([
			{
				variant: 'ghost',
				size: 'icon',
				onclick: () => {
					userConfig.setConfig({
						layout: userConfig.current.layout === 'full' ? 'fixed' : 'full'
					});
				}
			},
			restProps,
			{
				title: 'Toggle layout',
				children: ($$renderer) => {
					$$renderer.push(`<span class="sr-only">Toggle layout</span> `);
					GalleryHorizontalIcon($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}