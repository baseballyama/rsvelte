import * as $ from 'svelte/internal/server';

export default function Fullscreen($$renderer) {
	let dialogRef;

	function showModal() {
		document.body.style.overflow = 'hidden';
		dialogRef?.showModal();
	}

	function closeModal() {
		dialogRef?.close();
	}

	function onClose() {
		document.body.style.overflow = '';
	}

	$$renderer.push(`<dialog class="dialog dialog-fullscreen preset-filled-surface-100-900 animate-dialog"><header><h2 class="h3">Hello world!</h2></header> <article><p>This dialog expands to fill the entire viewport and locks page scrolling while open.</p></article> <footer class="flex justify-end"><form method="dialog"><button type="button" class="btn preset-tonal">Close</button></form></footer></dialog> <button class="btn preset-filled">Open Dialog</button>`);
}