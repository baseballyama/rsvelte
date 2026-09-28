import * as $ from 'svelte/internal/server';
import { movable } from '@svelte-put/movable';

export default function Handle($$renderer) {
	let handle = void 0;

	$$renderer.push(`<div class="hl-info flex h-40 w-40 flex-col p-2"><div class="hl-warning grid h-8 w-8 place-items-center self-end">.</div> <div class="grid flex-1 place-items-center self-stretch">...</div></div>`);
}