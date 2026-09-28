import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Multiple($$anchor) {
	Avatar($$anchor, {
		gravatar: 'nancy.wheeler@domain.com',
		uiAvatar: 'Nancy+Wheeler',
		size: 50
	});
}