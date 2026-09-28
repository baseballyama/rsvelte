import * as $ from 'svelte/internal/server';
import XIcon from '@lucide/svelte/icons/x';

export default function Input($$renderer) {
	$$renderer.push(`<div class="card preset-filled-surface-100-900 w-full max-w-md p-4"><div class="flex justify-center items-center gap-2"><span class="text-sm opacity-60">To</span> <button class="chip preset-outlined-surface-400-600"><span>jane@email.com</span> `);
	XIcon($$renderer, { size: 14 });
	$$renderer.push(`<!----></button> <button class="chip preset-outlined-surface-400-600"><span>dave@email.com</span> `);
	XIcon($$renderer, { size: 14 });
	$$renderer.push(`<!----></button></div></div>`);
}