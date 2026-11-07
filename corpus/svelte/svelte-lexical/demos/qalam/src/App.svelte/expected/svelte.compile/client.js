import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import Sidebar from './lib/Sidebar.svelte';
import Editor from './lib/Editor.svelte';
import { notesStore } from './lib/notesStore.svelte';

var root = $.from_html(`<div class="welcome svelte-zzvfli"><div class="welcome-content svelte-zzvfli"><div class="welcome-icon svelte-zzvfli">✦</div> <h1 class="svelte-zzvfli">Qalam</h1> <p class="svelte-zzvfli">A distraction-free rich text editor for your notes.</p> <button class="cta-btn svelte-zzvfli">New Note</button></div></div>`);
var root_1 = $.from_html(`<div class="app svelte-zzvfli"><!> <main class="main-area svelte-zzvfli"><!></main></div>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	onMount(async () => {
		await notesStore.init();
	});

	var div = root_1();
	var node = $.child(div);

	Sidebar(node, {});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	{
		var consequent = ($$anchor) => {
			Editor($$anchor, {
				get noteId() {
					return notesStore.activeNote.id;
				},

				get initialContent() {
					return notesStore.activeNoteContent;
				},

				get title() {
					return notesStore.activeNote.title;
				}
			});
		};

		var alternate = ($$anchor) => {
			var div_1 = root();
			var div_2 = $.child(div_1);
			var button = $.sibling($.child(div_2), 6);

			$.reset(div_2);
			$.reset(div_1);
			$.delegated('click', button, () => notesStore.createNote());
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (notesStore.activeNote) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(main);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);