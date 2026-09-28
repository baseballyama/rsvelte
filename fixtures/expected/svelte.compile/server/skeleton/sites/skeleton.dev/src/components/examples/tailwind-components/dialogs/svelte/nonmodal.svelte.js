import * as $ from 'svelte/internal/server';

export default function Nonmodal($$renderer) {
	let dialogRef;

	function toggle() {
		if (!dialogRef) return;

		if (dialogRef.open) {
			dialogRef.close();
		} else {
			dialogRef.show();
		}
	}

	$$renderer.push(`<div class="relative"><dialog closedby="any" class="dialog preset-filled-surface-100-900 animate-dialog [--dialog-top:auto] [--dialog-left:50%] [--dialog-translate:-50%_0] bottom-full mb-2 whitespace-nowrap"><p>This acts as a tooltip.</p></dialog> <button class="btn preset-filled">Toggle Dialog</button></div>`);
}