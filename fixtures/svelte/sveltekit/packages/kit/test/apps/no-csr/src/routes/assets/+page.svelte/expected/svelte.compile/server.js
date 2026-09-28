import * as $ from 'svelte/internal/server';
import image from './favicon.png?no-inline';

export default function _page($$renderer) {
	$$renderer.push(`<img${$.attr('src', image)} alt="svelte logo"/> <a href="/asset.json">includes public assets</a>`);
}