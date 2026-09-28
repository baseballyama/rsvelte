import * as $ from 'svelte/internal/server';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Gravatar_verbose($$renderer) {
	Avatar($$renderer, {
		gravatar: {
			email: 'maxmayfield@domain.com',
			rating: 'r',
			size: 50,
			default: 'monsterid'

			// forcedefault: 'y',
		}
	});
}