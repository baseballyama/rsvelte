import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isTauri } from '@tauri-apps/api/core';
import { confirm as confirmTauri } from '@tauri-apps/plugin-dialog';
import { notesStore } from './notesStore.svelte';
import Settings from './Settings.svelte';

var root = $.from_html(`<div class="empty-message svelte-uv8ryn">Loading notes…</div>`);
var root_1 = $.from_html(`<div class="empty-message svelte-uv8ryn">No notes yet. <br/> Click + to create one.</div>`);
var root_2 = $.from_html(`<input class="rename-input svelte-uv8ryn"/>`);
var root_3 = $.from_html(`<span class="note-title svelte-uv8ryn"> </span>`);
var root_4 = $.from_html(`<div role="button" tabindex="0"><div class="note-item-content svelte-uv8ryn"><!> <span class="note-date svelte-uv8ryn"> </span></div> <button class="delete-btn svelte-uv8ryn" title="Delete note" tabindex="-1">×</button></div>`);
var root_5 = $.from_html(`<aside class="sidebar svelte-uv8ryn"><div class="sidebar-header svelte-uv8ryn"><span class="app-name svelte-uv8ryn">Qalam</span> <div class="header-actions svelte-uv8ryn"><button class="icon-btn svelte-uv8ryn" title="Settings">⚙</button> <button class="new-note-btn svelte-uv8ryn" title="New note">+</button></div></div> <div class="notes-list svelte-uv8ryn"><!></div></aside> <!>`, 1);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	let editingId = $.state(null);
	let editingTitle = $.state('');
	let inputEl = $.state(null);
	let showSettings = $.state(false);

	function startRename(note) {
		$.set(editingId, note.id, true);
		$.set(editingTitle, note.title, true);
		setTimeout(() => $.get(inputEl)?.select(), 0);
	}

	async function commitRename() {
		if ($.get(editingId) && $.get(editingTitle).trim()) {
			await notesStore.renameNote($.get(editingId), $.get(editingTitle).trim());
		}

		$.set(editingId, null);
	}

	function cancelRename() {
		$.set(editingId, null);
	}

	function formatDate(iso) {
		const d = new Date(iso);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const days = Math.floor(diff / 86400000);

		if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		if (days === 1) return 'Yesterday';
		if (days < 7) return d.toLocaleDateString([], { weekday: 'short' });

		return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
	}

	async function handleDelete(e, id) {
		e.stopPropagation();

		const confirmed = isTauri()
			? await confirmTauri('Delete this note?', { title: 'Qalam' })
			: confirm('Delete this note?');

		if (confirmed) {
			await notesStore.deleteNote(id);
		}
	}

	var fragment = root_5();
	var aside = $.first_child(fragment);
	var div = $.child(aside);
	var div_1 = $.sibling($.child(div), 2);
	var button = $.child(div_1);
	var button_1 = $.sibling(button, 2);

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();

			$.append($$anchor, div_3);
		};

		var consequent_1 = ($$anchor) => {
			var div_4 = root_1();

			$.append($$anchor, div_4);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => notesStore.notes, (note) => note.id, ($$anchor, note) => {
				var div_5 = root_4();
				let classes;
				var div_6 = $.child(div_5);
				var node_2 = $.child(div_6);

				{
					var consequent_2 = ($$anchor) => {
						var input = root_2();

						$.remove_input_defaults(input);
						$.bind_this(input, ($$value) => $.set(inputEl, $$value), () => $.get(inputEl));
						$.event('blur', input, commitRename);

						$.delegated('keydown', input, (e) => {
							if (e.key === 'Enter') commitRename();
							if (e.key === 'Escape') cancelRename();
						});

						$.delegated('click', input, (e) => e.stopPropagation());
						$.bind_value(input, () => $.get(editingTitle), ($$value) => $.set(editingTitle, $$value));
						$.append($$anchor, input);
					};

					var alternate = ($$anchor) => {
						var span = root_3();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, $.get(note).title));

						$.delegated('dblclick', span, (e) => {
							e.stopPropagation();
							startRename($.get(note));
						});

						$.append($$anchor, span);
					};

					$.if(node_2, ($$render) => {
						if ($.get(editingId) === $.get(note).id) $$render(consequent_2); else $$render(alternate, -1);
					});
				}

				var span_1 = $.sibling(node_2, 2);
				var text_1 = $.only_child(span_1, true);

				$.reset(div_6);

				var button_2 = $.sibling(div_6, 2);

				$.reset(div_5);

				$.template_effect(
					($0) => {
						classes = $.set_class(div_5, 1, 'note-item svelte-uv8ryn', null, classes, { active: notesStore.activeNoteId === $.get(note).id });
						$.set_text(text_1, $0);
					},
					[() => formatDate($.get(note).updatedAt)]
				);

				$.delegated('click', div_5, () => notesStore.openNote($.get(note).id));
				$.delegated('keydown', div_5, (e) => e.key === 'Enter' && notesStore.openNote($.get(note).id));
				$.delegated('click', button_2, (e) => handleDelete(e, $.get(note).id));
				$.append($$anchor, div_5);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (notesStore.isLoading) $$render(consequent); else if (notesStore.notes.length === 0) $$render(consequent_1, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_2);
	$.reset(aside);

	var node_3 = $.sibling(aside, 2);

	{
		var consequent_3 = ($$anchor) => {
			Settings($$anchor, { onClose: () => $.set(showSettings, false) });
		};

		$.if(node_3, ($$render) => {
			if ($.get(showSettings)) $$render(consequent_3);
		});
	}

	$.delegated('click', button, () => $.set(showSettings, true));
	$.delegated('click', button_1, () => notesStore.createNote());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown', 'dblclick']);