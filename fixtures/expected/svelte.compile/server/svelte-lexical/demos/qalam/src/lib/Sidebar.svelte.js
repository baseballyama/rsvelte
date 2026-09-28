import * as $ from 'svelte/internal/server';
import { isTauri } from '@tauri-apps/api/core';
import { confirm as confirmTauri } from '@tauri-apps/plugin-dialog';
import { notesStore } from './notesStore.svelte';
import Settings from './Settings.svelte';

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let editingId = null;
		let editingTitle = '';
		let inputEl = null;
		let showSettings = false;

		function startRename(note) {
			editingId = note.id;
			editingTitle = note.title;
			setTimeout(() => inputEl?.select(), 0);
		}

		async function commitRename() {
			if (editingId && editingTitle.trim()) {
				await notesStore.renameNote(editingId, editingTitle.trim());
			}

			editingId = null;
		}

		function cancelRename() {
			editingId = null;
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

		$$renderer.push(`<aside class="sidebar svelte-uv8ryn"><div class="sidebar-header svelte-uv8ryn"><span class="app-name svelte-uv8ryn">Qalam</span> <div class="header-actions svelte-uv8ryn"><button class="icon-btn svelte-uv8ryn" title="Settings">⚙</button> <button class="new-note-btn svelte-uv8ryn" title="New note">+</button></div></div> <div class="notes-list svelte-uv8ryn">`);

		if (notesStore.isLoading) {
			$$renderer.push(`<!--[0--><div class="empty-message svelte-uv8ryn">Loading notes…</div>`);
		} else if (notesStore.notes.length === 0) {
			$$renderer.push(`<!--[1--><div class="empty-message svelte-uv8ryn">No notes yet. <br/> Click + to create one.</div>`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(notesStore.notes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let note = each_array[$$index];

				$$renderer.push(`<div${$.attr_class('note-item svelte-uv8ryn', void 0, { 'active': notesStore.activeNoteId === note.id })} role="button" tabindex="0"><div class="note-item-content svelte-uv8ryn">`);

				if (editingId === note.id) {
					$$renderer.push(`<!--[0--><input class="rename-input svelte-uv8ryn"${$.attr('value', editingTitle)}/>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="note-title svelte-uv8ryn">${$.escape(note.title)}</span>`);
				}

				$$renderer.push(`<!--]--> <span class="note-date svelte-uv8ryn">${$.escape(formatDate(note.updatedAt))}</span></div> <button class="delete-btn svelte-uv8ryn" title="Delete note" tabindex="-1">×</button></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></aside> `);

		if (showSettings) {
			$$renderer.push('<!--[0-->');
			Settings($$renderer, { onClose: () => showSettings = false });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}