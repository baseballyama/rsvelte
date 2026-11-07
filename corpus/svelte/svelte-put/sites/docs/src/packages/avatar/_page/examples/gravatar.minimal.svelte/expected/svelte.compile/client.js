import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Gravatar_minimal($$anchor) {
	Avatar($$anchor, { gravatar: 'vnphanquang@gmail.com', size: 50 });
}