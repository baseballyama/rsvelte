import * as $ from 'svelte/internal/server';
import siteConfig from 'virtual:sveltepress/site';
import { parseImageSrc } from '../utils';

export default function HeroImage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { heroImage } = $$props;

		$$renderer.push(`<div class="hero-image svelte-13xhun5"><img${$.attr('src', parseImageSrc(heroImage))}${$.attr('alt', siteConfig.title)} width="192" class="svelte-13xhun5"/></div>`);
	});
}