import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function UiAvatar_minimal($$anchor) {
	Avatar($$anchor, { uiAvatar: 'Eddie+Munson', size: 50 });
}