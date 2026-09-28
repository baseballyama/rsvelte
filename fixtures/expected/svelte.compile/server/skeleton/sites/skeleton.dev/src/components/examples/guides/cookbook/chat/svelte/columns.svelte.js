import * as $ from 'svelte/internal/server';

export default function Columns($$renderer) {
	$$renderer.push(`<div class="w-full grid grid-cols-[auto_1fr_auto] gap-1"><div class="bg-surface-100-900 p-4">(nav)</div> <div class="bg-surface-100-900 p-4">(feed)</div> <div class="bg-surface-100-900 p-4">(online)</div></div>`);
}