import * as $ from 'svelte/internal/server';

export default function Html_comment_input($$renderer) {
	$$renderer.push(`<img src="foo" alt="Foo"/> <img src="foo" alt="Foo" autofocus=""/>`);
}