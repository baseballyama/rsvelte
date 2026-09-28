import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';

export default function _page($$renderer) {
	$$renderer.push(`<h1 class="source">source (refreshAll: false)</h1> <form method="POST" action="/actions/cross-page/destination?/success"><input name="username" type="text" value="paolo"/> <button class="submit-success">Submit</button></form>`);
}