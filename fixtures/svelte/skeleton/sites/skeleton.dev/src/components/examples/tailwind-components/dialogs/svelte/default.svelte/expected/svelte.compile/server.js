import * as $ from 'svelte/internal/server';

export default function Default($$renderer) {
	let dialogRef;

	function showModal() {
		dialogRef?.showModal();
	}

	function closeModal() {
		dialogRef?.close();
	}

	$$renderer.push(`<dialog class="dialog preset-filled-surface-100-900 animate-dialog"><header><h2 class="h3">Hello world!</h2></header> <article><p>This is an example modal created using the native Dialog element.</p></article> <footer class="flex justify-end"><form method="dialog"><button type="button" class="btn preset-tonal">Close</button></form></footer></dialog> <button class="btn preset-filled">Open Dialog</button>`);
}