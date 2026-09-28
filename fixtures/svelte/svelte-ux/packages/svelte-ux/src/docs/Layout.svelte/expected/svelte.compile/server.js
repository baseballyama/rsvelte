import * as $ from 'svelte/internal/server';
import blockquote from './Blockquote.svelte';
import a from './Link.svelte';
import h1 from './Header1.svelte';

export { a, blockquote };

export default function Layout($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
	// frontmatter: https://mdsvex.com/docs#frontmatter-1
	// export let description = undefined;
}