import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root_1 = $.from_html(`<span class="save-indicator svelte-1g8o6ha">Saving…</span>`);
var root_2 = $.from_html(`<div class="editor-shell svelte-lexical svelte-1g8o6ha"><!> <div class="editor-scroller svelte-1g8o6ha"><div class="editor svelte-1g8o6ha"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div></div></div>`);
var root_3 = $.from_html(`<div class="editor-wrapper svelte-1g8o6ha"><div class="title-bar svelte-1g8o6ha"><input class="note-title-input svelte-1g8o6ha" placeholder="Untitled" spellcheck="false"/> <!></div> <!></div>`);

export default function Editor($$anchor, $$props) {
	$.push($$props, true);

	// Keyed by note id, holds each note's undo/redo stacks so switching notes
	// doesn't lose history. Lives at module scope (not component state) so it
	// survives even if the Editor component itself remounts (e.g. closing the
	// last note and opening a new one).
	const historyCache = new Map();

	let editorDiv = $.state(void 0);
	let titleInputEl = $.state(void 0);
	let composerRef = $.state(void 0);

	// svelte-ignore state_referenced_locally
	let editableTitle = $.state($.proxy($$props.title));

	let isBlankNote = $.derived(() => ($$props.title.trim() === '' || $$props.title === 'Untitled') && !$$props.initialContent);
	let saveTimer = null;

	// svelte-ignore state_referenced_locally
	let previousNoteId = $$props.noteId;

	$.user_effect(() => {
		$.set(editableTitle, $$props.title, true);
	});

	// The editor instance is shared across notes (App.svelte no longer
	// destroys/remounts Editor on note switch), so switching notes means
	// swapping the visible content and the active undo/redo stacks in place,
	// rather than relying on a fresh editor+history per note.
	$.user_effect(() => {
		const newNoteId = $$props.noteId;
		const newContent = $$props.initialContent;

		if (newNoteId === previousNoteId) return;

		const oldNoteId = previousNoteId;

		previousNoteId = newNoteId;
		switchNote(oldNoteId, newNoteId, newContent);

		// focus often requires a tick to ensure the editor is fully initialized
		tick().then(() => {
			if ($.get(isBlankNote)) {
				$.get(titleInputEl)?.focus();
				$.get(titleInputEl)?.select();
			} else {
				FocusEditor($.get(composerRef).getEditor());
			}
		});
	});

	function switchNote(oldNoteId, newNoteId, newContent) {
		const editor = $.get(composerRef)?.getEditor();
		const historyState = $.get(composerRef)?.getHistoryState();

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
		editorState: $$props.initialContent || undefined
	};

	function handleChange(editorState) {
		// Capture noteId now: this editor instance is shared across notes, so a
		// timer scheduled for note A must not save into whatever note is active
		// by the time it fires (e.g. if the user switches notes within 800ms).
		const targetNoteId = $$props.noteId;

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
		const trimmed = $.get(editableTitle).trim() || 'Untitled';

		$.set(editableTitle, trimmed, true);

		if (trimmed !== $$props.title) {
			await notesStore.renameNote($$props.noteId, trimmed);
		}
	}

	function handleTitleKeydown(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			e.target.blur();
			FocusEditor($.get(composerRef).getEditor());
		}
	}

	var div = root_3();
	var div_1 = $.child(div);
	var input = $.child(div_1);

	$.remove_input_defaults(input);
	$.bind_this(input, ($$value) => $.set(titleInputEl, $$value), () => $.get(titleInputEl));

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var span = root_1();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (notesStore.isSaving) $$render(consequent);
		});
	}

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	$.bind_this(
		Composer(node_1, {
			get initialConfig() {
				return initialConfig;
			},

			children: ($$anchor, $$slotProps) => {
				var div_2 = root_2();
				var node_2 = $.child(div_2);

				Toolbar(node_2, {});

				var div_3 = $.sibling(node_2, 2);
				var div_4 = $.child(div_3);
				var node_3 = $.child(div_4);

				RichTextPlugin(node_3, {});

				var node_4 = $.sibling(node_3, 2);

				ContentEditable(node_4, {});

				var node_5 = $.sibling(node_4, 2);

				PlaceHolder(node_5, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Start writing…');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				SharedHistoryPlugin(node_6, {});

				var node_7 = $.sibling(node_6, 2);

				ListPlugin(node_7, {});

				var node_8 = $.sibling(node_7, 2);

				CheckListPlugin(node_8, {});

				var node_9 = $.sibling(node_8, 2);

				LinkPlugin(node_9, {});

				var node_10 = $.sibling(node_9, 2);

				AutoLinkPlugin(node_10, {});

				var node_11 = $.sibling(node_10, 2);

				FloatingLinkEditorPlugin(node_11, {
					get anchorElem() {
						return $.get(editorDiv);
					}
				});

				var node_12 = $.sibling(node_11, 2);

				HorizontalRulePlugin(node_12, {});

				var node_13 = $.sibling(node_12, 2);

				ColumnLayoutPlugin(node_13, {});

				var node_14 = $.sibling(node_13, 2);

				CodeHighlightShikiPlugin(node_14, {});

				var node_15 = $.sibling(node_14, 2);

				CodeActionMenuPlugin(node_15, {
					get anchorElem() {
						return $.get(editorDiv);
					}
				});

				var node_16 = $.sibling(node_15, 2);

				ImagePlugin(node_16, {
					children: ($$anchor, $$slotProps) => {
						CaptionEditorHistoryPlugin($$anchor, {});
					},
					$$slots: { default: true }
				});

				var node_17 = $.sibling(node_16, 2);

				MarkdownShortcutPlugin(node_17, {
					get transformers() {
						return ALL_TRANSFORMERS;
					}
				});

				var node_18 = $.sibling(node_17, 2);

				TablePlugin(node_18, { hasHorizontalScroll: true });

				var node_19 = $.sibling(node_18, 2);

				TableHoverActionPlugin(node_19, {
					get anchorElem() {
						return $.get(editorDiv);
					}
				});

				var node_20 = $.sibling(node_19, 2);

				TableCellResizerPlugin(node_20, {});

				var node_21 = $.sibling(node_20, 2);

				TableActionMenuPlugin(node_21, {
					get anchorElem() {
						return $.get(editorDiv);
					},
					cellMerge: true
				});

				var node_22 = $.sibling(node_21, 2);

				YoutubePlugin(node_22, {});

				var node_23 = $.sibling(node_22, 2);

				TwitterPlugin(node_23, {});

				var node_24 = $.sibling(node_23, 2);

				BlueskyPlugin(node_24, {});

				var node_25 = $.sibling(node_24, 2);

				TabIndentationPlugin(node_25, {});

				var node_26 = $.sibling(node_25, 2);

				ComponentPickerMenuPlugin(node_26, {});

				var node_27 = $.sibling(node_26, 2);

				OnChangePlugin(node_27, {
					onChange: handleChange,
					ignoreSelectionChange: true,
					ignoreHistoryMergeTagChange: true
				});

				$.reset(div_4);
				$.bind_this(div_4, ($$value) => $.set(editorDiv, $$value), () => $.get(editorDiv));
				$.reset(div_3);
				$.reset(div_2);
				$.append($$anchor, div_2);
			},
			$$slots: { default: true }
		}),
		($$value) => $.set(composerRef, $$value, true),
		() => $.get(composerRef)
	);

	$.reset(div);
	$.event('blur', input, handleTitleBlur);
	$.delegated('keydown', input, handleTitleKeydown);
	$.bind_value(input, () => $.get(editableTitle), ($$value) => $.set(editableTitle, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown']);