import * as $ from 'svelte/internal/server';

export default function Mustache_with_comment_input($$renderer) {
	$$renderer.push(`<!---->${$.escape(foo())}`);
}