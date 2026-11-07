import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<img src="/fetch-image/image.jpg" alt=""/> <img src="/fetch-image/image.png" alt=""/>`);
}