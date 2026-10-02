import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`${$.html(`\u{73}`)} ${$.html('\u{73}')} ${$.html("\u{73}")} \\u73`);
}