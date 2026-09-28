import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	BubbleMenu,
	getEditor,
	removeAIHighlight,
	useEditorTransaction
} from '../../../tiptap/index.js';

import { toast } from 'svelte-sonner';

import {
	AIState,
	CONTINUE_WRITING_PROMPT,
	FIX_GRAMMAR_PROMPT,
	IMPROVE_WRITING_PROMPT,
	MAKE_LONGER_PROMPT,
	MAKE_SHORTER_PROMPT,
	SIMPLIFY_LANGUAGE_PROMPT,
	SOLVE_PROBLEM_PROMPT,
	SUMMARIZE_PROMPT
} from '../../../commands/index.js';

import { fade, slide } from 'svelte/transition';

import {
	Sparkle,
	Check,
	CornerDownLeft,
	Copy,
	RotateCcw,
	Trash2,
	Brain,
	ArrowDownWideNarrow,
	CheckCheck,
	Feather,
	PenLine,
	RefreshCcwDot,
	Sparkles,
	TextWrap,
	Send
} from '@lucide/svelte';

import { Button } from '$lib/components/ui/button/index.js';

var root = $.from_html(`<span class="rounded-sm bg-muted/75 px-1 text-muted-foreground svelte-1unrtp5">Enter</span>`);
var root_1 = $.from_html(`<button><!> <span class="ml-2 flex-1 text-start font-medium svelte-1unrtp5"> </span> <!></button>`);
var root_2 = $.from_html(`<div class="flex max-h-72 flex-col overflow-y-auto p-1.5 svelte-1unrtp5"></div>`);
var root_3 = $.from_html(`<div class="flex w-xl flex-col overflow-hidden rounded-xl border shadow-2xl backdrop-blur-2xl svelte-1unrtp5"><form class="flex items-start px-3 py-3 svelte-1unrtp5"><textarea placeholder="Ask AI anything..." class="h-auto max-h-40 w-full resize-none border-0 outline-hidden svelte-1unrtp5"></textarea> <!></form> <!></div>`);
var root_4 = $.from_html(`<div class="dot h-1.25 w-1.25 rounded-full bg-primary svelte-1unrtp5"></div>`);
var root_5 = $.from_html(`<div class="animated-gradient-border rounded p-0.5 svelte-1unrtp5"><div class="flex items-center gap-2 rounded-md bg-popover p-1 svelte-1unrtp5"><!> <span class="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text font-semibold text-transparent svelte-1unrtp5">AI is writing</span> <div class="flex h-5 items-center space-x-0.5 svelte-1unrtp5"><!> <span class="sr-only svelte-1unrtp5">Loading</span></div></div></div>`);
var root_6 = $.from_html(`<!> Replace`, 1);
var root_7 = $.from_html(`<!> Insert`, 1);
var root_8 = $.from_html(`<!> Copy`, 1);
var root_9 = $.from_html(`<!> Retry`, 1);
var root_10 = $.from_html(`<!> Discard`, 1);
var root_11 = $.from_html(`<div class="flex items-center justify-between gap-2 rounded-lg border p-2 shadow-2xl svelte-1unrtp5"><!> <!> <!> <!> <!></div>`);

export default function AI($$anchor, $$props) {
	$.push($$props, true);

	const // Position tracking for inline editor streaming
	// Save current selection positions
	// Calculate insertion position: right after the top-level block containing the selection end
	// Final flush to ensure all content is rendered in the editor
	/** Throttle editor updates to ~100ms to avoid excessive transactions */
	/** Insert or replace the AI content region in the editor with the accumulated response */
	// First insert — no existing AI content to replace
	// Replace existing AI content with the updated (longer) response
	// The content AFTER the AI region is unchanged, so:
	// newAiContentTo = newDocSize - (oldDocSize - oldAiContentTo)
	// Highlight the AI-generated content with a distinct color
	// Move cursor to end of AI content so bubble menu follows it
	/** Remove AI-generated content from the editor (without adding to undo history) */
	/** Replace: delete original selection, keep AI text */
	// Delete everything from original selection start to AI content end
	// Insert the AI response at the original position
	/** Insert below: AI text is already below the selection — just accept */
	/** Copy AI response to clipboard */
	/** Retry: delete AI content, re-run with same prompt */
	/** Discard: delete AI content, keep original, reset */
	/** Close AI: full cleanup */
	// If still generating, just mark for cleanup
	MenuButton = ($$anchor, action = $.noop, idx = $.noop) => {
		const Icon = $.derived(() => action().icon);
		var button = root_1();
		var node_1 = $.child(button);

		$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
			Icon_1($$anchor, {});
		});

		var span = $.sibling(node_1, 2);
		var text_1 = $.only_child(span, true);
		var node_2 = $.sibling(span, 2);

		{
			var consequent = ($$anchor) => {
				var span_1 = root();

				$.append($$anchor, span_1);
			};

			$.if(node_2, ($$render) => {
				if ($.get(activeOptionIndex) === idx()) $$render(consequent);
			});
		}

		$.reset(button);

		$.template_effect(() => {
			$.set_class(
				button,
				1,
				`group/dropdown-menu-item relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden transition-colors select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive ${$.get(activeOptionIndex) === idx()
					? 'quick-action-active bg-accent text-accent-foreground'
					: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`,
				'svelte-1unrtp5'
			);

			$.set_text(text_1, action().label);
		});

		$.delegated('click', button, function (...$$args) {
			action().handler?.apply(this, $$args);
		});

		$.append($$anchor, button);
	};

	let inputTag = $.state(null);
	const editor = getEditor();
	let inputValue = $.state('');
	let aiState = $.state($.proxy(AIState.Idle));
	let aiResponse = $.state('');
	let activeOptionIndex = $.state(0);
	let generating = $.state(false);
	let originalFrom = $.state(0);
	let aiContentFrom = $.state(0);
	let aiContentTo = $.state(0);
	let lastPrompt = $.state('');
	let updateTimer = null;
	const activeCallAI = $.derived(() => editor.extensionManager.extensions.find((e) => e.name === 'ai-highlight')?.options?.callAI);
	const transaction = useEditorTransaction(editor);

	function isAIActive() {
		void transaction.version;

		return editor.isActive('ai-highlight');
	}

	function getAIHighlightedText() {
		void transaction.version;

		let range = { from: -1, to: -1 };

		editor.state.doc.descendants((node, pos) => {
			if (node.marks.some((mark) => mark.type.name === 'ai-highlight')) {
				if (range.from === -1) range.from = pos;

				range.to = pos + node.nodeSize;
			}
		});

		if (range.from === -1 || range.to === -1) return undefined;

		const slice = editor.view.state.doc.cut(range.from, range.to);

		if (editor.markdown) return editor.markdown.serialize(slice.toJSON());

		return editor.state.doc.textBetween(range.from, range.to);
	}

	async function processText(type) {
		const id = Symbol('AI_THINKING_TOAST').toString();
		const selectedText = getAIHighlightedText();

		if (!selectedText || selectedText.trim().length === 0) {
			toast.error('Can not get the selected content from editor', { id });

			return;
		}

		try {
			let prompt = '';

			switch (type) {
				case 'shorter':
					prompt = MAKE_SHORTER_PROMPT(selectedText);
					break;

				case 'longer':
					prompt = MAKE_LONGER_PROMPT(selectedText);
					break;

				case 'summarize':
					prompt = SUMMARIZE_PROMPT(selectedText);
					break;

				case 'grammer':
					prompt = FIX_GRAMMAR_PROMPT(selectedText);
					break;

				case 'continue':
					prompt = CONTINUE_WRITING_PROMPT(selectedText);
					break;

				case 'solve':
					prompt = SOLVE_PROBLEM_PROMPT(selectedText);
					break;

				case 'improve':
					prompt = IMPROVE_WRITING_PROMPT(selectedText);
					break;

				case 'simplify':
					prompt = SIMPLIFY_LANGUAGE_PROMPT(selectedText);
					break;
			}

			$.set(aiState, AIState.Confirmation, true);
			await generateAIContent(prompt);
		} catch(error) {
			$.set(aiState, AIState.Idle, true);
			console.error(error);
			toast.error('Something went wrong! Check console.', { id });
		}
	}

	async function handleSubmit(e) {
		if (e) e.preventDefault();
		if (!$.get(inputValue) || $.get(inputValue).trim().length === 0) return;

		const text = getAIHighlightedText() || '';

		try {
			const prompt = `${text}\n\n\n${$.get(inputValue)}`;

			$.set(inputValue, '');

			if ($.get(inputTag)) $.get(inputTag).style.height = 'auto';

			$.set(aiState, AIState.Confirmation, true);
			await generateAIContent(prompt);
		} catch(error) {
			$.set(aiState, AIState.Idle, true);
			console.error(error);
			toast.error('Something went wrong! Check console.');
		}
	}

	async function generateAIContent(prompt, isRetry = false) {
		void transaction.version;
		$.set(generating, true);
		$.set(lastPrompt, prompt, true);
		$.set(aiResponse, '');

		if (!isRetry) {
			// Save current selection positions
			const { from, to } = editor.state.selection;

			$.set(originalFrom, from, true);

			// Calculate insertion position: right after the top-level block containing the selection end
			const to_ = editor.state.doc.resolve(to);

			const depth = Math.min(to_.depth, 1) || 1;

			$.set(aiContentFrom, to_.after(depth), true);
			$.set(aiContentTo, $.get(aiContentFrom), true);
		} else {
			$.set(aiContentTo, $.get(aiContentFrom), true);
		}

		try {
			const onChunk = (chunk) => {
				$.set(aiResponse, $.get(aiResponse) + chunk);
				scheduleEditorUpdate();
			};

			const onError = (error) => {
				toast.error('Something went wrong when calling AI.', { description: error.message });
				console.error(error);
				cleanupAIContent();
				$.set(aiState, AIState.Idle, true);
				$.set(aiResponse, '');
				$.set(generating, false);
			};

			if ($.get(activeCallAI)) {
				await $.get(activeCallAI)(prompt, onChunk, onError);
			}

			// Final flush to ensure all content is rendered in the editor
			flushEditorUpdate();
		} finally {
			$.set(generating, false);
		}
	}

	/** Throttle editor updates to ~100ms to avoid excessive transactions */
	function scheduleEditorUpdate() {
		if (updateTimer) return;

		updateTimer = setTimeout(
			() => {
				flushEditorUpdate();
				updateTimer = null;
			},
			100
		);
	}

	/** Insert or replace the AI content region in the editor with the accumulated response */
	function flushEditorUpdate() {
		void transaction.version;

		if (updateTimer) {
			clearTimeout(updateTimer);
			updateTimer = null;
		}

		if (!$.get(aiResponse)) return;

		try {
			const oldDocSize = editor.state.doc.content.size;

			if ($.get(aiContentFrom) >= $.get(aiContentTo)) {
				// First insert — no existing AI content to replace
				editor.chain().command(({ tr }) => {
					tr.setMeta('addToHistory', false);

					return true;
				}).insertContentAt($.get(aiContentFrom), $.get(aiResponse), { contentType: 'markdown' }).run();
			} else {
				// Replace existing AI content with the updated (longer) response
				editor.chain().command(({ tr }) => {
					tr.setMeta('addToHistory', false);

					return true;
				}).insertContentAt({ from: $.get(aiContentFrom), to: $.get(aiContentTo) }, $.get(aiResponse), { contentType: 'markdown' }).run();
			}

			const newDocSize = editor.state.doc.content.size;

			// The content AFTER the AI region is unchanged, so:
			// newAiContentTo = newDocSize - (oldDocSize - oldAiContentTo)
			$.set(aiContentTo, newDocSize - (oldDocSize - $.get(aiContentTo)));

			// Highlight the AI-generated content with a distinct color
			const tr = editor.state.tr;

			tr.setMeta('addToHistory', false);
			tr.addMark($.get(aiContentFrom), $.get(aiContentTo), editor.state.schema.marks['ai-highlight'].create({ color: 'var(--color-muted)' }));
			editor.view.dispatch(tr);

			// Move cursor to end of AI content so bubble menu follows it
			if ($.get(aiContentTo) > 1) {
				editor.commands.setTextSelection($.get(aiContentTo) - 1);
			}
		} catch(error) {
			console.error('Error updating editor with AI content:', error);
		}
	}

	/** Remove AI-generated content from the editor (without adding to undo history) */
	function cleanupAIContent() {
		void transaction.version;

		if ($.get(aiContentFrom) < $.get(aiContentTo)) {
			try {
				editor.chain().command(({ tr }) => {
					tr.setMeta('addToHistory', false);

					return true;
				}).deleteRange({ from: $.get(aiContentFrom), to: $.get(aiContentTo) }).run();

				$.set(aiContentTo, $.get(aiContentFrom), true);
			} catch(error) {
				console.error('Error cleaning up AI content:', error);
			}
		}
	}

	/** Replace: delete original selection, keep AI text */
	function replaceSelection() {
		void transaction.version;

		try {
			const response = $.get(aiResponse);

			// Delete everything from original selection start to AI content end
			editor.chain().deleteRange({ from: $.get(originalFrom), to: $.get(aiContentTo) }).run();

			// Insert the AI response at the original position
			editor.chain().insertContentAt($.get(originalFrom), response, { contentType: 'markdown' }).run();

			removeAIHighlight(editor);
			$.set(aiState, AIState.Idle, true);
			$.set(aiResponse, '');
		} catch(error) {
			console.error(error);
			toast.error('Unable to replace. Copy content and paste manually.');
		}
	}

	/** Insert below: AI text is already below the selection — just accept */
	function insertNext() {
		removeAIHighlight(editor);
		$.set(aiState, AIState.Idle, true);
		$.set(aiResponse, '');
	}

	/** Copy AI response to clipboard */
	function copyToClipboard() {
		window.navigator.clipboard.writeText($.get(aiResponse));
		toast.success('Copied to clipboard');
	}

	/** Retry: delete AI content, re-run with same prompt */
	function retry() {
		cleanupAIContent();
		$.set(aiResponse, '');

		if ($.get(lastPrompt)) {
			generateAIContent($.get(lastPrompt), true);
		}
	}

	/** Discard: delete AI content, keep original, reset */
	function discardChanges() {
		cleanupAIContent();
		removeAIHighlight(editor);
		$.set(aiState, AIState.Idle, true);
		$.set(aiResponse, '');
	}

	/** Close AI: full cleanup */
	function closeAI() {
		if ($.get(generating)) {
			// If still generating, just mark for cleanup
			$.set(generating, false);
		}

		cleanupAIContent();
		removeAIHighlight(editor);
		$.set(aiState, AIState.Idle, true);
		$.set(aiResponse, '');
		$.set(lastPrompt, '');
	}

	const quickActions = [
		{
			id: 'improve',
			label: 'Improve writing',
			icon: Sparkles,
			handler: () => processText('improve')
		},

		{
			id: 'grammer',
			label: 'Fix spelling & grammar',
			icon: CheckCheck,
			handler: () => processText('grammer')
		},

		{
			id: 'shorter',
			label: 'Make shorter',
			icon: ArrowDownWideNarrow,
			handler: () => processText('shorter')
		},

		{
			id: 'longer',
			label: 'Make longer',
			icon: TextWrap,
			handler: () => processText('longer')
		},

		{
			id: 'simplify',
			label: 'Simplify language',
			icon: Feather,
			handler: () => processText('simplify')
		},

		{
			id: 'summarize',
			label: 'Summarize',
			icon: RefreshCcwDot,
			handler: () => processText('summarize')
		},

		{
			id: 'continue',
			label: 'Continue writing',
			icon: PenLine,
			handler: () => processText('continue')
		},

		{
			id: 'solve',
			label: 'Solve problem',
			icon: Brain,
			handler: () => processText('solve')
		}
	];

	function scrollActiveOptionIntoView() {
		setTimeout(
			() => {
				const activeEl = document.querySelector('.quick-action-active');

				if (activeEl) {
					activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
				}
			},
			0
		);
	}

	function handleKeydown(event) {
		if (!isAIActive() && $.get(aiState) !== AIState.Confirmation) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			closeAI();

			return;
		}

		if ($.get(aiState) === AIState.Idle) {
			const showQuickActions = isAIActive() && $.get(inputValue).trim()?.length === 0;

			if (showQuickActions) {
				if (event.key === 'ArrowDown') {
					event.preventDefault();
					$.set(activeOptionIndex, ($.get(activeOptionIndex) + 1) % quickActions.length);
					scrollActiveOptionIntoView();

					return;
				}

				if (event.key === 'ArrowUp') {
					event.preventDefault();
					$.set(activeOptionIndex, ($.get(activeOptionIndex) - 1 + quickActions.length) % quickActions.length);
					scrollActiveOptionIntoView();

					return;
				}

				if (event.key === 'Enter') {
					event.preventDefault();
					quickActions[$.get(activeOptionIndex)].handler();

					return;
				}
			} else {
				if (event.key === 'Enter' && !event.shiftKey) {
					event.preventDefault();
					handleSubmit();

					return;
				}
			}
		}
	}

	function handleInput(e) {
		const target = e.target;

		target.style.height = `${target.scrollHeight}px`;
	}

	$.event('keydown', $.document, handleKeydown);

	{
		let $0 = $.derived(() => ({
			strategy: 'absolute',
			autoPlacement: { allowedPlacements: ['bottom-start', 'top-start'] },
			scrollTarget: editor.view.dom.parentElement ?? window,
			onShow() {
				$.set(activeOptionIndex, 0);
				$.get(inputTag)?.focus({ preventScroll: true });
			},

			onHide() {
				$.get(inputTag)?.blur();
			}
		}));

		BubbleMenu($$anchor, {
			get editor() {
				return editor;
			},
			pluginKey: 'ai-bubble-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, view } = props;

				if (!propsEditor || !propsEditor.isEditable || propsEditor.isDestroyed) return false;
				if (!view || propsEditor.view.dragging) return false;

				// Always show during AI confirmation (streaming or action bar)
				if ($.get(aiState) === AIState.Confirmation) return true;

				if (propsEditor.isActive('ai-highlight')) return true;

				removeAIHighlight(propsEditor);
				$.set(aiState, AIState.Idle, true);
				$.set(aiResponse, '');

				return false;
			},
			class: 'absolute z-100 flex max-h-120 max-w-3xl flex-col rounded-lg bg-popover/75 p-0 backdrop-blur-2xl transition-[height] duration-500',
			get options() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				{
					var consequent_2 = ($$anchor) => {
						var div = root_3();
						var form = $.child(div);
						var textarea = $.child(form);

						$.remove_textarea_child(textarea);
						$.set_attribute(textarea, 'rows', 1);
						$.bind_this(textarea, ($$value) => $.set(inputTag, $$value), () => $.get(inputTag));

						var node_4 = $.sibling(textarea, 2);

						Button(node_4, {
							type: 'submit',
							size: 'icon-lg',
							class: 'rounded-full',
							children: ($$anchor, $$slotProps) => {
								Send($$anchor, {});
							},
							$$slots: { default: true }
						});

						$.reset(form);

						var node_5 = $.sibling(form, 2);

						{
							var consequent_1 = ($$anchor) => {
								var div_1 = root_2();

								$.each(div_1, 23, () => quickActions, (action) => action.id, ($$anchor, action, idx) => {
									MenuButton($$anchor, () => $.get(action), () => $.get(idx));
								});

								$.reset(div_1);
								$.transition(3, div_1, () => slide, () => ({ axis: 'y', duration: 250 }));
								$.append($$anchor, div_1);
							};

							var d = $.derived(() => isAIActive() && $.get(inputValue).trim()?.length === 0);

							$.if(node_5, ($$render) => {
								if ($.get(d)) $$render(consequent_1);
							});
						}

						$.reset(div);
						$.delegated('input', textarea, handleInput);
						$.bind_value(textarea, () => $.get(inputValue), ($$value) => $.set(inputValue, $$value));
						$.append($$anchor, div);
					};

					var consequent_4 = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_6 = $.first_child(fragment_4);

						{
							var consequent_3 = ($$anchor) => {
								var div_2 = root_5();
								var div_3 = $.child(div_2);
								var node_7 = $.child(div_3);

								Sparkle(node_7, { class: 'size-4!' });

								var div_4 = $.sibling(node_7, 4);
								var node_8 = $.child(div_4);

								$.each(node_8, 16, () => Array(3), $.index, ($$anchor, id, i) => {
									var div_5 = root_4();

									$.set_style(div_5, '', {}, { 'animation-delay': `${i * 160}ms` });
									$.template_effect(() => $.set_attribute(div_5, 'data-ball-number', id));
									$.append($$anchor, div_5);
								});

								$.next(2);
								$.reset(div_4);
								$.reset(div_3);
								$.reset(div_2);
								$.transition(3, div_2, () => fade);
								$.append($$anchor, div_2);
							};

							var alternate = ($$anchor) => {
								var div_6 = root_11();
								var node_9 = $.child(div_6);

								Button(node_9, {
									size: 'sm',
									onclick: replaceSelection,
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_6();
										var node_10 = $.first_child(fragment_5);

										Check(node_10, {});
										$.next();
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});

								var node_11 = $.sibling(node_9, 2);

								Button(node_11, {
									variant: 'outline',
									size: 'sm',
									onclick: insertNext,
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_7();
										var node_12 = $.first_child(fragment_6);

										CornerDownLeft(node_12, {});
										$.next();
										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});

								var node_13 = $.sibling(node_11, 2);

								Button(node_13, {
									variant: 'outline',
									size: 'sm',
									onclick: copyToClipboard,
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_8();
										var node_14 = $.first_child(fragment_7);

										Copy(node_14, {});
										$.next();
										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});

								var node_15 = $.sibling(node_13, 2);

								Button(node_15, {
									variant: 'outline',
									size: 'sm',
									onclick: retry,
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_9();
										var node_16 = $.first_child(fragment_8);

										RotateCcw(node_16, {});
										$.next();
										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});

								var node_17 = $.sibling(node_15, 2);

								Button(node_17, {
									variant: 'destructive',
									size: 'sm',
									onclick: discardChanges,
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_10();
										var node_18 = $.first_child(fragment_9);

										Trash2(node_18, {});
										$.next();
										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});

								$.reset(div_6);
								$.transition(3, div_6, () => fade);
								$.append($$anchor, div_6);
							};

							$.if(node_6, ($$render) => {
								if ($.get(generating)) $$render(consequent_3); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_4);
					};

					$.if(node_3, ($$render) => {
						if ($.get(aiState) === AIState.Idle) $$render(consequent_2); else if ($.get(aiState) === AIState.Confirmation) $$render(consequent_4, 1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}

$.delegate(['click', 'input']);