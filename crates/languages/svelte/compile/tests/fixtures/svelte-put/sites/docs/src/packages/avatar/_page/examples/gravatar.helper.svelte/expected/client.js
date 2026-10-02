import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gravatar } from '@svelte-put/avatar';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Gravatar_helper($$anchor, $$props) {
	$.push($$props, true);

	const gravatarUrl = gravatar({
		email: 'willbyers@domain.com',
		rating: 'r',
		size: 50,
		default: 'retro'

		// forcedefault: 'y',
	});

	Avatar($$anchor, {
		get src() {
			return gravatarUrl;
		}
	});

	$.pop();
}