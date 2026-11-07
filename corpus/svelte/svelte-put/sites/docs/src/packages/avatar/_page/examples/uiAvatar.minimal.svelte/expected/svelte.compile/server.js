import * as $ from 'svelte/internal/server';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function UiAvatar_minimal($$renderer) {
	Avatar($$renderer, { uiAvatar: 'Eddie+Munson', size: 50 });
}