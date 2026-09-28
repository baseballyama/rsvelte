import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';

export default function Broken($$renderer) {
	$$renderer.push(`<div class="svelte-1b4pumk">`);
	Icon($$renderer, { icon: 'ph:image-broken-duotone', width: '2.5rem' });
	$$renderer.push(`<!----></div>`);
}