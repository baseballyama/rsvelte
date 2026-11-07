import * as $ from 'svelte/internal/server';

function figure($$renderer, { src, caption, width, height }) {
	$$renderer.push(`<figure><img${$.attr('alt', caption)}${$.attr('src', src)}${$.attr('width', width)}${$.attr('height', height)}/> <figcaption>${$.escape(caption)}</figcaption></figure>`);
}

export default function _2_input($$renderer) {}