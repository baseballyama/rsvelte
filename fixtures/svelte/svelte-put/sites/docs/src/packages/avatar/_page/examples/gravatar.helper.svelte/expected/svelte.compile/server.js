import * as $ from 'svelte/internal/server';
import { gravatar } from '@svelte-put/avatar';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Gravatar_helper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const gravatarUrl = gravatar({
			email: 'willbyers@domain.com',
			rating: 'r',
			size: 50,
			default: 'retro'

			// forcedefault: 'y',
		});

		Avatar($$renderer, { src: gravatarUrl });
	});
}