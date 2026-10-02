import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>This page will only be discovered if pages whose content-type has a charset parameter are crawled</h1>`);
}