import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Hello from inside the nested layout component</h1> <div><a href="/nested-layout/error">error</a></div>`);
}