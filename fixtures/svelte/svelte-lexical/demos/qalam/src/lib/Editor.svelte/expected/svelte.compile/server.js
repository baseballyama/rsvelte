import * as $ from 'svelte/internal/server';

import {
	Composer,
	ContentEditable,
	RichTextPlugin,
	ListPlugin,
	CheckListPlugin,
	LinkPlugin,
	OnChangePlugin,
	PlaceHolder,
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	AutoLinkNode,
	LinkNode,
	CodeNode,
	CodeHighlightNode,
	HorizontalRuleNode,
	ImageNode,
	LayoutContainerNode,
	LayoutItemNode,
	TableNode,
	TableCellNode,
	TableRowNode,
	YouTubeNode,
	TweetNode,
	BlueskyNode,
	AutoLinkPlugin,
	ColumnLayoutPlugin,
	SharedHistoryPlugin,
	ImagePlugin,
	CaptionEditorHistoryPlugin,
	HorizontalRulePlugin,
	MarkdownShortcutPlugin,
	ALL_TRANSFORMERS,
	TablePlugin,
	TableHoverActionPlugin,
	TableCellResizerPlugin,
	TableActionMenuPlugin,
	YoutubePlugin,
	TwitterPlugin,
	BlueskyPlugin,
	TabIndentationPlugin,
	CodeActionMenuPlugin,
	FloatingLinkEditorPlugin,
	ComponentPickerMenuPlugin,
	FocusEditor,
	CAN_UNDO_COMMAND,
	CAN_REDO_COMMAND,
	HISTORY_MERGE_TAG,
	$getRoot as getRoot,
	$createParagraphNode as createParagraphNode
} from 'svelte-lexical';

import { CodeHighlightShikiPlugin } from 'svelte-lexical/shiki';
import { theme as editorTheme } from 'svelte-lexical/dist/themes/default';
import { notesStore } from './notesStore.svelte';
import Toolbar from './Toolbar.svelte';
import { tick } from 'svelte';

export default function Editor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Keyed by note id, holds each note's undo/redo stacks so switching notes
		// doesn't lose history. Lives at module scope (not component state) so it
		// survives even if the Editor component itself remounts (e.g. closing the
		// last note and opening a new one).
		const historyCache = new Map();

		let { noteId, initialContent, title } = $$props;
		let editorDiv = void 0;
		let titleInputEl = void 0;
		let composerRef = void 0;

		// svelte-ignore state_referenced_locally
		let editableTitle = title;

		let isBlankNote = $.derived(() => (title.trim() === '' || title === 'Untitled') && !initialContent);
		let saveTimer = null;

		// svelte-ignore state_referenced_locally
		let previousNoteId = noteId;

		// The editor instance is shared across notes (App.svelte no longer
		// destroys/remounts Editor on note switch), so switching notes means
		// swapping the visible content and the active undo/redo stacks in place,
		// rather than relying on a fresh editor+history per note.
		// focus often requires a tick to ensure the editor is fully initialized
		function switchNote(oldNoteId, newNoteId, newContent) {
			const editor = composerRef?.getEditor();
			const historyState = composerRef?.getHistoryState();

			if (!editor || !historyState) return;

			// Flush any pending debounced save for the note we're leaving, and clear
			// the timer so it can't later fire and clobber the next note's save.
			if (saveTimer) {
				clearTimeout(saveTimer);
				saveTimer = null;
				notesStore.saveNoteContent(oldNoteId, JSON.stringify(editor.getEditorState().toJSON()));
			}

			historyCache.set(oldNoteId, {
				undoStack: historyState.undoStack,
				redoStack: historyState.redoStack
			});

			const cached = historyCache.get(newNoteId);

			historyState.undoStack = cached ? cached.undoStack : [];
			historyState.redoStack = cached ? cached.redoStack : [];
			editor.dispatchCommand(CAN_UNDO_COMMAND, historyState.undoStack.length > 0);
			editor.dispatchCommand(CAN_REDO_COMMAND, historyState.redoStack.length > 0);

			if (newContent) {
				editor.setEditorState(editor.parseEditorState(newContent), { tag: HISTORY_MERGE_TAG });
			} else {
				editor.update(
					() => {
						const root = getRoot();

						root.clear();
						root.append(createParagraphNode());
					},
					{ tag: HISTORY_MERGE_TAG }
				);
			}
		}

		// svelte-ignore state_referenced_locally
		const initialConfig = {
			namespace: 'QalamEditor',
			nodes: [
				HeadingNode,
				ListNode,
				ListItemNode,
				QuoteNode,
				HorizontalRuleNode,
				ImageNode,
				AutoLinkNode,
				LinkNode,
				CodeNode,
				CodeHighlightNode,
				LayoutContainerNode,
				LayoutItemNode,
				TableNode,
				TableCellNode,
				TableRowNode,
				YouTubeNode,
				TweetNode,
				BlueskyNode
			],

			// eslint-disable-next-line no-console
			onError: (error) => console.error(error),
			theme: editorTheme,
			editorState: initialContent || undefined
		};

		function handleChange(editorState) {
			// Capture noteId now: this editor instance is shared across notes, so a
			// timer scheduled for note A must not save into whatever note is active
			// by the time it fires (e.g. if the user switches notes within 800ms).
			const targetNoteId = noteId;

			if (saveTimer) clearTimeout(saveTimer);

			saveTimer = setTimeout(
				async () => {
					saveTimer = null;
					await notesStore.saveNoteContent(targetNoteId, JSON.stringify(editorState.toJSON()));
				},
				800
			);
		}

		async function handleTitleBlur() {
			const trimmed = editableTitle.trim() || 'Untitled';

			editableTitle = trimmed;

			if (trimmed !== title) {
				await notesStore.renameNote(noteId, trimmed);
			}
		}

		function handleTitleKeydown(e) {
			if (e.key === 'Enter') {
				e.preventDefault();
				e.target.blur();
				FocusEditor(composerRef.getEditor());
			}
		}

		$$renderer.push(`<div class="editor-wrapper svelte-1g8o6ha"><div class="title-bar svelte-1g8o6ha"><input class="note-title-input svelte-1g8o6ha"${$.attr('value', editableTitle)} placeholder="Untitled" spellcheck="false"/> `);

		if (notesStore.isSaving) {
			$$renderer.push(`<!--[0--><span class="save-indicator svelte-1g8o6ha">Saving…</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		Composer($$renderer, {
			initialConfig,
			children: ($$renderer) => {
				$$renderer.push(`<div class="editor-shell svelte-lexical svelte-1g8o6ha">`);
				Toolbar($$renderer, {});
				$$renderer.push(`<!----> <div class="editor-scroller svelte-1g8o6ha"><div class="editor svelte-1g8o6ha">`);
				RichTextPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ContentEditable($$renderer, {});
				$$renderer.push(`<!----> `);

				PlaceHolder($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Start writing…`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				SharedHistoryPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ListPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				CheckListPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				LinkPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				AutoLinkPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				FloatingLinkEditorPlugin($$renderer, { anchorElem: editorDiv });
				$$renderer.push(`<!----> `);
				HorizontalRulePlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ColumnLayoutPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				CodeHighlightShikiPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				CodeActionMenuPlugin($$renderer, { anchorElem: editorDiv });
				$$renderer.push(`<!----> `);

				ImagePlugin($$renderer, {
					children: ($$renderer) => {
						CaptionEditorHistoryPlugin($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				MarkdownShortcutPlugin($$renderer, { transformers: ALL_TRANSFORMERS });
				$$renderer.push(`<!----> `);
				TablePlugin($$renderer, { hasHorizontalScroll: true });
				$$renderer.push(`<!----> `);
				TableHoverActionPlugin($$renderer, { anchorElem: editorDiv });
				$$renderer.push(`<!----> `);
				TableCellResizerPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				TableActionMenuPlugin($$renderer, { anchorElem: editorDiv, cellMerge: true });
				$$renderer.push(`<!----> `);
				YoutubePlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				TwitterPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				BlueskyPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				TabIndentationPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ComponentPickerMenuPlugin($$renderer, {});
				$$renderer.push(`<!----> `);

				OnChangePlugin($$renderer, {
					onChange: handleChange,
					ignoreSelectionChange: true,
					ignoreHistoryMergeTagChange: true
				});

				$$renderer.push(`<!----></div></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}