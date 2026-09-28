import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { dev } from '$app/environment';
import { imagesLocal, imagesUrl } from '$lib/site/config';

export default function Image($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { src, alt } = $$props;
		const images = dev ? imagesLocal : imagesUrl;
		const slug = page.params.slug;

		$$renderer.push(`<img${$.attr('src', `${$.stringify(images)}/${$.stringify(slug)}/images/${$.stringify(src)}`)}${$.attr('alt', alt)} loading="lazy"/>`);
	});
}