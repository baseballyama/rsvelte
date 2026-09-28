import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p dir="rtl">text</p>.`);
}