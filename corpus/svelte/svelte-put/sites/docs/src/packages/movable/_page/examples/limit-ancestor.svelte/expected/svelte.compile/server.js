import * as $ from 'svelte/internal/server';
import { movable } from '@svelte-put/movable';

export default function Limit_ancestor($$renderer) {
	let parentNode;

	$$renderer.push(`<div class="grid place-items-center border-2 border-violet-500 p-4"><p class="text-center">Box below can be moved around, but only within the violet border</p> <div class="hl-info grid h-20 w-20 place-items-center">...</div></div>`);
}