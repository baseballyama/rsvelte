import * as $ from 'svelte/internal/server';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Gravatar_minimal($$renderer) {
	Avatar($$renderer, { gravatar: 'vnphanquang@gmail.com', size: 50 });
}