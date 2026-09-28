import * as $ from 'svelte/internal/server';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Multiple($$renderer) {
	Avatar($$renderer, {
		gravatar: 'nancy.wheeler@domain.com',
		uiAvatar: 'Nancy+Wheeler',
		size: 50
	});
}