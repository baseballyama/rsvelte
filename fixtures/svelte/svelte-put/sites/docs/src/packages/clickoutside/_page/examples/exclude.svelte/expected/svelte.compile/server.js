import * as $ from 'svelte/internal/server';
import { clickoutside } from '@svelte-put/clickoutside';

export default function Exclude($$renderer) {
	let leftOpen = true;

	// :::highlight success
	function toggleLeft(e) {
		e.stopPropagation();
		leftOpen = !leftOpen;
	}

	// :::
	let rightOpen = false;

	// :::highlight error
	function toggleRight() {
		rightOpen = !rightOpen;
	}

	// :::
	let containerEl = undefined;

	$$renderer.push(`<div class="relative w-full overflow-hidden"><div${$.attr_class(`bg-success-bg-100 absolute inset-y-0 left-0 grid w-1/3 origin-left place-items-center transition-[opacity_transform] ${leftOpen ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-50'}`)}><div class="i i-[arrow-right] h-8 w-8"></div></div> <div class="mx-auto flex w-1/3"><button class="hl-success inline flex-1 cursor-pointer p-2 active:scale-95">Toggle Left</button> <button class="hl-error inline flex-1 cursor-pointer p-2 active:scale-95">Toggle Right</button></div> <div${$.attr_class(`bg-error-bg-100 absolute inset-y-0 right-0 grid w-1/3 origin-right place-items-center ${rightOpen ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-50'}`)}><div class="i i-[arrow-left] h-8 w-8"></div></div></div>`);
}