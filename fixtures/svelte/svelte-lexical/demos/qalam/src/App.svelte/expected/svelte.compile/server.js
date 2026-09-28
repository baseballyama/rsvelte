import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import Sidebar from './lib/Sidebar.svelte';
import Editor from './lib/Editor.svelte';
import { notesStore } from './lib/notesStore.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(async () => {
			await notesStore.init();
		});

		$$renderer.push(`<div class="app svelte-zzvfli">`);
		Sidebar($$renderer, {});
		$$renderer.push(`<!----> <main class="main-area svelte-zzvfli">`);

		if (notesStore.activeNote) {
			$$renderer.push('<!--[0-->');

			Editor($$renderer, {
				noteId: notesStore.activeNote.id,
				initialContent: notesStore.activeNoteContent,
				title: notesStore.activeNote.title
			});
		} else {
			$$renderer.push(`<!--[-1--><div class="welcome svelte-zzvfli"><div class="welcome-content svelte-zzvfli"><div class="welcome-icon svelte-zzvfli">✦</div> <h1 class="svelte-zzvfli">Qalam</h1> <p class="svelte-zzvfli">A distraction-free rich text editor for your notes.</p> <button class="cta-btn svelte-zzvfli">New Note</button></div></div>`);
		}

		$$renderer.push(`<!--]--></main></div>`);
	});
}