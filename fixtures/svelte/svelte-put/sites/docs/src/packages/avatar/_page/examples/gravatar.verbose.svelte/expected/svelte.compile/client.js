import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Gravatar_verbose($$anchor) {
	Avatar($$anchor, {
		gravatar: {
			email: 'maxmayfield@domain.com',
			rating: 'r',
			size: 50,
			default: 'monsterid'

			// forcedefault: 'y',
		}
	});
}