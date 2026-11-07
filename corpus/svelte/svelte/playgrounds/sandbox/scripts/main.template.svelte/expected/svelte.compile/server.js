import * as $ from 'svelte/internal/server';

export default function Main_template($$renderer) {
	function openInEditor() {
		fetch('./__open-in-editor?file=src/main.svelte');
	}

	$$renderer.push(`<h1>Demo App</h1> <button class="open-in-editor">edit main.svelte</button>`);
}