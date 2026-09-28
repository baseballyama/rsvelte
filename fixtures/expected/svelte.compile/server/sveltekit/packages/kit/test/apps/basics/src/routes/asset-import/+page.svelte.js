import * as $ from 'svelte/internal/server';
import small from './small.png';
import large from './large.jpg';

export default function _page($$renderer) {
	$$renderer.push(`<img alt="svelte"${$.attr('src', small)}/> <img alt="potatoes"${$.attr('src', large)}/>`);
}