import * as $ from 'svelte/internal/server';

export default function Alertdialog($$renderer) {
	let dialogRef;

	function showModal() {
		dialogRef?.showModal();
	}

	function closeModal() {
		dialogRef?.close();
	}

	$$renderer.push(`<dialog role="alertdialog" aria-labelledby="alertdialog-title" aria-describedby="alertdialog-description" class="dialog animate-dialog preset-filled-error-500 [--dialog-backdrop:color-mix(in_oklab,var(--color-error-50-950)_75%,transparent)]"><header><h2 id="alertdialog-title" class="h3">Discard changes?</h2></header> <article><p id="alertdialog-description">You have unsaved changes that will be lost. This action cannot be undone.</p></article> <footer class="flex justify-end gap-2"><button type="button" class="btn preset-tonal">Cancel</button> <button type="button" class="btn preset-filled">Discard</button></footer></dialog> <button class="btn preset-filled">Open Dialog</button>`);
}