import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/streaming/universal">Universal</a> <a href="/streaming/server">Server</a> <a href="/streaming/server-error">Server Error</a> <a href="/streaming/server/delayed-rejection">Server Delayed Rejection</a>`);
}