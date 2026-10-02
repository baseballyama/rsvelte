import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';

export default function _page($$renderer) {
	$$renderer.push(`<form method="POST"><button type="submit">submit</button></form>`);
}