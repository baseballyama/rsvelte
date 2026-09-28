import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div autofocus=""></div> <dialog autofocus=""></dialog> <dialog><input autofocus=""/></dialog>`);
}