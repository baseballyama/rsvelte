import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<svg><text><a>not actually a link</a></text></svg><svg><text><a xlink:href="">not actually a link</a></text></svg><svg><text><a xlink:href="#">not actually a link</a></text></svg>`);
}