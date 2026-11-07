import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/reroute/error-handling/client-error" id="client-error">Url with client error</a> <a href="/reroute/error-handling/server-error" id="server-error">Url with server error</a>`);
}