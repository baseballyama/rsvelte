import * as $ from 'svelte/internal/server';
import a from '$lib/components/A.svelte';

export { a };

export default function Layout($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}