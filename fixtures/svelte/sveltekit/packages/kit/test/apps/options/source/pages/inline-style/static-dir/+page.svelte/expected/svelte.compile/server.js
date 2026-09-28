import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<div class="svelte-16rk2mg"></div> <p>Assets located in the static directory have their URL path transformed to '../../../asset.png'
	instead of './asset.png' like most assets that go through Vite's static asset handling</p>`);
}