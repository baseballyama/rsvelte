import 'svelte/internal/disclose-version';
import blockquote from './Blockquote.svelte';
import a from './Link.svelte';
import h1 from './Header1.svelte';
import * as $ from 'svelte/internal/client';

export { a, blockquote };

export default function Layout($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	// frontmatter: https://mdsvex.com/docs#frontmatter-1
	// export let description = undefined;
}