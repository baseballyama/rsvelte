import * as $ from 'svelte/internal/server';

export default function Animation($$renderer) {
	let dialogRef;

	function showModal() {
		dialogRef?.showModal();
	}

	function closeModal() {
		dialogRef?.close();
	}

	$$renderer.push(`<dialog class="dialog animate-dialog preset-filled-surface-100-900"><header><h2 class="h3">Hello world!</h2></header> <article><p>Opening and closing this dialog fades the surface and backdrop.</p></article> <footer class="flex justify-end"><form method="dialog"><button type="button" class="btn preset-tonal">Close</button></form></footer></dialog> <button class="btn preset-filled">Open Dialog</button>`);
}