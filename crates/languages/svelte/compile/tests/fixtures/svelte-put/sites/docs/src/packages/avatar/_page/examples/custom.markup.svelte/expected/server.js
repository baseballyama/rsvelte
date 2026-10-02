import * as $ from 'svelte/internal/server';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Custom_markup($$renderer) {
	{
		function img($$renderer, { src, size, alt, sources }) {
			$$renderer.push(`<img${$.attr('src', src)}${$.attr('alt', alt)}${$.attr('width', size)}${$.attr('height', size)}${$.attr('data-sources', sources)}/>`);
		}

		Avatar($$renderer, {
			size: 50,
			gravatar: 'billy.hargrove@domain.com',
			uiAvatar: 'Billy+Hargrove',
			img,
			$$slots: { img: true }
		});
	}
}