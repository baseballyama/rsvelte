import * as $ from 'svelte/internal/server';
import MobileNav from './MobileNav.svelte';

export default function MobileMainNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { logo, socials } = $$props;

		{
			function topbarLeft($$renderer) {
				$$renderer.push(`<a${$.attr('href', import.meta.env.BASE_URL)}>`);
				logo?.($$renderer);
				$$renderer.push(`<!----></a>`);
			}

			function content($$renderer) {
				$$renderer.push(`<div class="flex flex-col gap-2 text-lg"><a${$.attr('href', `${import.meta.env.BASE_URL}docs/learn/getting-started/introduction`)}>Documentation</a> <a${$.attr('href', `${import.meta.env.BASE_URL}blog`)}>Blog</a>  <div class="mt-4">`);
				socials?.($$renderer);
				$$renderer.push(`<!----></div></div>`);
			}

			MobileNav($$renderer, {
				topbarLeft,
				content,
				$$slots: { topbarLeft: true, content: true }
			});
		}
	});
}