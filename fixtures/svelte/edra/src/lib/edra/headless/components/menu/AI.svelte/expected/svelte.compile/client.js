import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	BubbleMenu,
	getEditor,
	removeAIHighlight,
	useEditorTransaction
} from '../../../tiptap/index.js';

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

var root = $.from_html(`<span class="enter-badge svelte-1v5syb9">Enter</span>`);
var root_1 = $.from_html(`<button><!> <span class="action-label svelte-1v5syb9"> </span> <!></button>`);
var root_2 = $.from_html(`<div class="status-message-bar svelte-1v5syb9"> </div>`);
var root_3 = $.from_html(`<div class="actions-list svelte-1v5syb9"></div>`);
var root_4 = $.from_html(`<div class="panel-width svelte-1v5syb9"><form class="form-wrapper svelte-1v5syb9"><textarea placeholder="Ask AI anything..." class="input-textarea svelte-1v5syb9"></textarea> <button type="submit" class="edra-btn edra-btn-primary edra-btn-icon send-btn svelte-1v5syb9"><!></button></form> <!></div>`);
var root_5 = $.from_html(`<div class="loading-inner-wrapper svelte-1v5syb9"><div class="loading-row svelte-1v5syb9"><!> <span class="txt-ink font-semibold svelte-1v5syb9">AI is writing...</span></div></div>`);
var root_6 = $.from_html(`<div class="confirmation-row svelte-1v5syb9"><button class="edra-btn edra-btn-primary h-8-btn text-xs-btn svelte-1v5syb9"><!> Replace</button> <button class="edra-btn h-8-btn text-xs-btn svelte-1v5syb9"><!> Insert</button> <button class="edra-btn h-8-btn text-xs-btn svelte-1v5syb9"><!> Copy</button> <button class="edra-btn h-8-btn text-xs-btn svelte-1v5syb9"><!> Retry</button> <button class="edra-btn edra-btn-destructive h-8-btn text-xs-btn svelte-1v5syb9"><!> Discard</button></div>`);
var root_7 = $.from_html(`<!> <!>`, 1);

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
	MenuButton = ($$anchor, action = $.noop, idx = $.noop) => {
		const Icon = $.derived(() => action().icon);
		var button = root_1();
		var node_1 = $.child(button);

		$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
			Icon_1($$anchor, { class: 'action-icon' });
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
			$.set_class(button, 1, `quick-action-item ${$.get(activeOptionIndex) === idx() ? 'active quick-action-active' : ''}`, 'svelte-1v5syb9');
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
	let statusMessage = $.state('');
	let originalFrom = $.state(0);
	let aiContentFrom = $.state(0);
	let aiContentTo = $.state(0);
	let lastPrompt = $.state('');
	let updateTimer = null;
	const activeCallAI = $.derived(() => editor.extensionManager.extensions.find((e) => e.name === 'ai-highlight')?.options?.callAI);
	const transaction = useEditorTransaction(editor);

	function showStatus(msg, duration = 3000) {
		$.set(statusMessage, msg, true);

		setTimeout(
			() => {
				$.set(statusMessage, '');
			},
			duration
		);
	}

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
		const selectedText = getAIHighlightedText();

		if (!selectedText || selectedText.trim().length === 0) {
			showStatus('Can not get the selected content from editor');

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
			showStatus('Something went wrong!');
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
			showStatus('Something went wrong!');
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
				showStatus('Something went wrong when calling AI.');
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
			tr.addMark($.get(aiContentFrom), $.get(aiContentTo), editor.state.schema.marks['ai-highlight'].create({ color: 'var(--edra-canvas-soft-2)' }));
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
			showStatus('Unable to replace. Copy and paste manually.');
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
		showStatus('Copied to clipboard');
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
			class: 'ai-bubble-container',
			get options() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_7();
				var node_3 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var div = root_2();
						var text_2 = $.only_child(div, true);

						$.template_effect(() => $.set_text(text_2, $.get(statusMessage)));
						$.append($$anchor, div);
					};

					$.if(node_3, ($$render) => {
						if ($.get(statusMessage)) $$render(consequent_1);
					});
				}

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_1 = root_4();
						var form = $.child(div_1);
						var textarea = $.child(form);

						$.remove_textarea_child(textarea);
						$.set_attribute(textarea, 'rows', 1);
						$.bind_this(textarea, ($$value) => $.set(inputTag, $$value), () => $.get(inputTag));

						var button_1 = $.sibling(textarea, 2);
						var node_5 = $.child(button_1);

						Send(node_5, { class: 'action-icon' });
						$.reset(button_1);
						$.reset(form);

						var node_6 = $.sibling(form, 2);

						{
							var consequent_2 = ($$anchor) => {
								var div_2 = root_3();

								$.each(div_2, 23, () => quickActions, (action) => action.id, ($$anchor, action, idx) => {
									MenuButton($$anchor, () => $.get(action), () => $.get(idx));
								});

								$.reset(div_2);
								$.transition(3, div_2, () => slide, () => ({ axis: 'y', duration: 250 }));
								$.append($$anchor, div_2);
							};

							var d = $.derived(() => isAIActive() && $.get(inputValue).trim()?.length === 0);

							$.if(node_6, ($$render) => {
								if ($.get(d)) $$render(consequent_2);
							});
						}

						$.reset(div_1);
						$.event('submit', form, handleSubmit);
						$.delegated('input', textarea, handleInput);
						$.bind_value(textarea, () => $.get(inputValue), ($$value) => $.set(inputValue, $$value));
						$.append($$anchor, div_1);
					};

					var consequent_5 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_7 = $.first_child(fragment_3);

						{
							var consequent_4 = ($$anchor) => {
								var div_3 = root_5();
								var div_4 = $.child(div_3);
								var node_8 = $.child(div_4);

								Sparkle(node_8, { class: 'animate-sparkle sparkle-icon' });
								$.next(2);
								$.reset(div_4);
								$.reset(div_3);
								$.transition(3, div_3, () => fade);
								$.append($$anchor, div_3);
							};

							var alternate = ($$anchor) => {
								var div_5 = root_6();
								var button_2 = $.child(div_5);
								var node_9 = $.child(button_2);

								Check(node_9, { class: 'action-icon' });
								$.next();
								$.reset(button_2);

								var button_3 = $.sibling(button_2, 2);
								var node_10 = $.child(button_3);

								CornerDownLeft(node_10, { class: 'action-icon' });
								$.next();
								$.reset(button_3);

								var button_4 = $.sibling(button_3, 2);
								var node_11 = $.child(button_4);

								Copy(node_11, { class: 'action-icon' });
								$.next();
								$.reset(button_4);

								var button_5 = $.sibling(button_4, 2);
								var node_12 = $.child(button_5);

								RotateCcw(node_12, { class: 'action-icon' });
								$.next();
								$.reset(button_5);

								var button_6 = $.sibling(button_5, 2);
								var node_13 = $.child(button_6);

								Trash2(node_13, { class: 'action-icon' });
								$.next();
								$.reset(button_6);
								$.reset(div_5);
								$.delegated('click', button_2, replaceSelection);
								$.delegated('click', button_3, insertNext);
								$.delegated('click', button_4, copyToClipboard);
								$.delegated('click', button_5, retry);
								$.delegated('click', button_6, discardChanges);
								$.transition(3, div_5, () => fade);
								$.append($$anchor, div_5);
							};

							$.if(node_7, ($$render) => {
								if ($.get(generating)) $$render(consequent_4); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.if(node_4, ($$render) => {
						if ($.get(aiState) === AIState.Idle) $$render(consequent_3); else if ($.get(aiState) === AIState.Confirmation) $$render(consequent_5, 1);
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