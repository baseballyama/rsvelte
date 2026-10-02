import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	$$renderer.push(`<div class="blog-post"><h1>${$.escape(post.title)}</h1> ${$.html(post.content)}</div>`);
}