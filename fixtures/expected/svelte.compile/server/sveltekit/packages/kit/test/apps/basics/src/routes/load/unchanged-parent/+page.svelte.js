import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/load/unchanged-parent/uses-parent/a">uses parent</a> <a href="/load/unchanged-parent/isolated/a">isolated</a>`);
}