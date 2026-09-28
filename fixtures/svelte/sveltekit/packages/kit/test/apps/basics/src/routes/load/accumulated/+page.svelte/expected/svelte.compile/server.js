import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/load/accumulated/with-page-data">with page data</a> <a href="/load/accumulated/without-page-data">without page data</a>`);
}