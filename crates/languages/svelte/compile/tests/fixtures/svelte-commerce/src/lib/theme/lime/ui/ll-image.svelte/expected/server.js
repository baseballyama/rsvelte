import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';

export default function Ll_image($$renderer, $$props) {
	/**
	 * Lime image frame — square, no-radius, blush (#f5f5f5) backdrop,
	 * matching the source product/category imagery. Falls back to the shared
	 * empty-image placeholder when no source is provided.
	 */
	let { src, alt = '', ratio = '1 / 1', fit = 'cover' } = $$props;

	$$renderer.push(`<div class="ll-image svelte-2cj1ms"${$.attr_style(`aspect-ratio: ${$.stringify(ratio)};`)}>`);

	if (src) {
		$$renderer.push('<!--[0-->');

		LazyImg($$renderer, {
			src,
			alt,
			class: `ll-image-img ll-image-img--${$.stringify(fit)}`
		});
	} else {
		$$renderer.push('<!--[-1-->');
		EmptyImage($$renderer, { class: 'll-image-empty' });
	}

	$$renderer.push(`<!--]--></div>`);
}