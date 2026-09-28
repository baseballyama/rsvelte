import * as $ from 'svelte/internal/server';
import { notesStore } from './notesStore.svelte';

export default function Settings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onClose } = $$props;
		let copied = false;

		async function copyPath() {
			await navigator.clipboard.writeText(notesStore.notesDir);
			copied = true;
			setTimeout(() => copied = false, 1500);
		}

		function handleKeydown(e) {
			if (e.key === 'Escape') onClose();
		}

		$$renderer.push(`<div class="overlay svelte-1fqbcn2" role="presentation"><div class="dialog svelte-1fqbcn2" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="dialog-header svelte-1fqbcn2"><h2 id="settings-title" class="svelte-1fqbcn2">Settings</h2> <button class="close-btn svelte-1fqbcn2" aria-label="Close">×</button></div> <div class="dialog-body svelte-1fqbcn2"><label class="field-label svelte-1fqbcn2" for="notes-path">Notes location</label> <div class="path-row svelte-1fqbcn2"><input id="notes-path" class="path-input svelte-1fqbcn2"${$.attr('value', notesStore.notesDir)} readonly=""/> <button class="copy-btn svelte-1fqbcn2">${$.escape(copied ? 'Copied!' : 'Copy')}</button></div></div></div></div>`);
	});
}