import * as $ from 'svelte/internal/server';

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

export default function AI($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputTag = null;
		const editor = getEditor();
		let inputValue = '';
		let aiState = AIState.Idle;
		let aiResponse = '';
		let activeOptionIndex = 0;
		let generating = false;
		let statusMessage = '';

		// Position tracking for inline editor streaming
		let originalFrom = 0;

		let aiContentFrom = 0;
		let aiContentTo = 0;
		let lastPrompt = '';
		let updateTimer = null;
		const activeCallAI = $.derived(() => editor.extensionManager.extensions.find((e) => e.name === 'ai-highlight')?.options?.callAI);
		const transaction = useEditorTransaction(editor);

		function showStatus(msg, duration = 3000) {
			statusMessage = msg;

			setTimeout(
				() => {
					statusMessage = '';
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

				aiState = AIState.Confirmation;
				await generateAIContent(prompt);
			} catch(error) {
				aiState = AIState.Idle;
				console.error(error);
				showStatus('Something went wrong!');
			}
		}

		async function handleSubmit(e) {
			if (e) e.preventDefault();
			if (!inputValue || inputValue.trim().length === 0) return;

			const text = getAIHighlightedText() || '';

			try {
				const prompt = `${text}\n\n\n${inputValue}`;

				inputValue = '';

				if (inputTag) inputTag.style.height = 'auto';

				aiState = AIState.Confirmation;
				await generateAIContent(prompt);
			} catch(error) {
				aiState = AIState.Idle;
				console.error(error);
				showStatus('Something went wrong!');
			}
		}

		async function generateAIContent(prompt, isRetry = false) {
			void transaction.version;
			generating = true;
			lastPrompt = prompt;
			aiResponse = '';

			if (!isRetry) {
				// Save current selection positions
				const { from, to } = editor.state.selection;

				originalFrom = from;

				// Calculate insertion position: right after the top-level block containing the selection end
				const to_ = editor.state.doc.resolve(to);

				const depth = Math.min(to_.depth, 1) || 1;

				aiContentFrom = to_.after(depth);
				aiContentTo = aiContentFrom;
			} else {
				aiContentTo = aiContentFrom;
			}

			try {
				const onChunk = (chunk) => {
					aiResponse += chunk;
					scheduleEditorUpdate();
				};

				const onError = (error) => {
					showStatus('Something went wrong when calling AI.');
					console.error(error);
					cleanupAIContent();
					aiState = AIState.Idle;
					aiResponse = '';
					generating = false;
				};

				if (activeCallAI()) {
					await activeCallAI()(prompt, onChunk, onError);
				}

				// Final flush to ensure all content is rendered in the editor
				flushEditorUpdate();
			} finally {
				generating = false;
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

			if (!aiResponse) return;

			try {
				const oldDocSize = editor.state.doc.content.size;

				if (aiContentFrom >= aiContentTo) {
					// First insert — no existing AI content to replace
					editor.chain().command(({ tr }) => {
						tr.setMeta('addToHistory', false);

						return true;
					}).insertContentAt(aiContentFrom, aiResponse, { contentType: 'markdown' }).run();
				} else {
					// Replace existing AI content with the updated (longer) response
					editor.chain().command(({ tr }) => {
						tr.setMeta('addToHistory', false);

						return true;
					}).insertContentAt({ from: aiContentFrom, to: aiContentTo }, aiResponse, { contentType: 'markdown' }).run();
				}

				const newDocSize = editor.state.doc.content.size;

				// The content AFTER the AI region is unchanged, so:
				// newAiContentTo = newDocSize - (oldDocSize - oldAiContentTo)
				aiContentTo = newDocSize - (oldDocSize - aiContentTo);

				// Highlight the AI-generated content with a distinct color
				const tr = editor.state.tr;

				tr.setMeta('addToHistory', false);
				tr.addMark(aiContentFrom, aiContentTo, editor.state.schema.marks['ai-highlight'].create({ color: 'var(--edra-canvas-soft-2)' }));
				editor.view.dispatch(tr);

				// Move cursor to end of AI content so bubble menu follows it
				if (aiContentTo > 1) {
					editor.commands.setTextSelection(aiContentTo - 1);
				}
			} catch(error) {
				console.error('Error updating editor with AI content:', error);
			}
		}

		/** Remove AI-generated content from the editor (without adding to undo history) */
		function cleanupAIContent() {
			void transaction.version;

			if (aiContentFrom < aiContentTo) {
				try {
					editor.chain().command(({ tr }) => {
						tr.setMeta('addToHistory', false);

						return true;
					}).deleteRange({ from: aiContentFrom, to: aiContentTo }).run();

					aiContentTo = aiContentFrom;
				} catch(error) {
					console.error('Error cleaning up AI content:', error);
				}
			}
		}

		/** Replace: delete original selection, keep AI text */
		function replaceSelection() {
			void transaction.version;

			try {
				const response = aiResponse;

				// Delete everything from original selection start to AI content end
				editor.chain().deleteRange({ from: originalFrom, to: aiContentTo }).run();

				// Insert the AI response at the original position
				editor.chain().insertContentAt(originalFrom, response, { contentType: 'markdown' }).run();

				removeAIHighlight(editor);
				aiState = AIState.Idle;
				aiResponse = '';
			} catch(error) {
				console.error(error);
				showStatus('Unable to replace. Copy and paste manually.');
			}
		}

		/** Insert below: AI text is already below the selection — just accept */
		function insertNext() {
			removeAIHighlight(editor);
			aiState = AIState.Idle;
			aiResponse = '';
		}

		/** Copy AI response to clipboard */
		function copyToClipboard() {
			window.navigator.clipboard.writeText(aiResponse);
			showStatus('Copied to clipboard');
		}

		/** Retry: delete AI content, re-run with same prompt */
		function retry() {
			cleanupAIContent();
			aiResponse = '';

			if (lastPrompt) {
				generateAIContent(lastPrompt, true);
			}
		}

		/** Discard: delete AI content, keep original, reset */
		function discardChanges() {
			cleanupAIContent();
			removeAIHighlight(editor);
			aiState = AIState.Idle;
			aiResponse = '';
		}

		/** Close AI: full cleanup */
		function closeAI() {
			if (generating) {
				generating = false;
			}

			cleanupAIContent();
			removeAIHighlight(editor);
			aiState = AIState.Idle;
			aiResponse = '';
			lastPrompt = '';
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
			if (!isAIActive() && aiState !== AIState.Confirmation) return;

			if (event.key === 'Escape') {
				event.preventDefault();
				closeAI();

				return;
			}

			if (aiState === AIState.Idle) {
				const showQuickActions = isAIActive() && inputValue.trim()?.length === 0;

				if (showQuickActions) {
					if (event.key === 'ArrowDown') {
						event.preventDefault();
						activeOptionIndex = (activeOptionIndex + 1) % quickActions.length;
						scrollActiveOptionIntoView();

						return;
					}

					if (event.key === 'ArrowUp') {
						event.preventDefault();
						activeOptionIndex = (activeOptionIndex - 1 + quickActions.length) % quickActions.length;
						scrollActiveOptionIntoView();

						return;
					}

					if (event.key === 'Enter') {
						event.preventDefault();
						quickActions[activeOptionIndex].handler();

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

		function MenuButton($$renderer, action, idx) {
			const Icon = action.icon;

			$$renderer.push(`<button${$.attr_class(`quick-action-item ${activeOptionIndex === idx ? 'active quick-action-active' : ''}`, 'svelte-1v5syb9')}>`);

			if (Icon) {
				$$renderer.push('<!--[-->');
				Icon($$renderer, { class: 'action-icon' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <span class="action-label svelte-1v5syb9">${$.escape(action.label)}</span> `);

			if (activeOptionIndex === idx) {
				$$renderer.push(`<!--[0--><span class="enter-badge svelte-1v5syb9">Enter</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		}

		BubbleMenu($$renderer, {
			editor,
			pluginKey: 'ai-bubble-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, view } = props;

				if (!propsEditor || !propsEditor.isEditable || propsEditor.isDestroyed) return false;
				if (!view || propsEditor.view.dragging) return false;

				// Always show during AI confirmation (streaming or action bar)
				if (aiState === AIState.Confirmation) return true;

				if (propsEditor.isActive('ai-highlight')) return true;

				removeAIHighlight(propsEditor);
				aiState = AIState.Idle;
				aiResponse = '';

				return false;
			},
			class: 'ai-bubble-container',
			options: {
				strategy: 'absolute',
				autoPlacement: { allowedPlacements: ['bottom-start', 'top-start'] },
				scrollTarget: editor.view.dom.parentElement ?? window,
				onShow() {
					activeOptionIndex = 0;
					inputTag?.focus({ preventScroll: true });
				},

				onHide() {
					inputTag?.blur();
				}
			},

			children: ($$renderer) => {
				if (statusMessage) {
					$$renderer.push(`<!--[0--><div class="status-message-bar svelte-1v5syb9">${$.escape(statusMessage)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (aiState === AIState.Idle) {
					$$renderer.push(`<!--[0--><div class="panel-width svelte-1v5syb9"><form class="form-wrapper svelte-1v5syb9"><textarea${$.attr('rows', 1)} placeholder="Ask AI anything..." class="input-textarea svelte-1v5syb9">`);

					const $$body = $.escape(inputValue);

					if ($$body) {
						$$renderer.push(`${$$body}`);
					} else {}

					$$renderer.push(`</textarea> <button type="submit" class="edra-btn edra-btn-primary edra-btn-icon send-btn svelte-1v5syb9">`);
					Send($$renderer, { class: 'action-icon' });
					$$renderer.push(`<!----></button></form> `);

					if (isAIActive() && inputValue.trim()?.length === 0) {
						$$renderer.push(`<!--[0--><div class="actions-list svelte-1v5syb9"><!--[-->`);

						const each_array = $.ensure_array_like(quickActions);

						for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
							let action = each_array[idx];

							MenuButton($$renderer, action, idx);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else if (aiState === AIState.Confirmation) {
					$$renderer.push('<!--[1-->');

					if (generating) {
						$$renderer.push(`<!--[0--><div class="loading-inner-wrapper svelte-1v5syb9"><div class="loading-row svelte-1v5syb9">`);
						Sparkle($$renderer, { class: 'animate-sparkle sparkle-icon' });
						$$renderer.push(`<!----> <span class="txt-ink font-semibold svelte-1v5syb9">AI is writing...</span></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="confirmation-row svelte-1v5syb9"><button class="edra-btn edra-btn-primary h-8-btn text-xs-btn svelte-1v5syb9">`);
						Check($$renderer, { class: 'action-icon' });
						$$renderer.push(`<!----> Replace</button> <button class="edra-btn h-8-btn text-xs-btn svelte-1v5syb9">`);
						CornerDownLeft($$renderer, { class: 'action-icon' });
						$$renderer.push(`<!----> Insert</button> <button class="edra-btn h-8-btn text-xs-btn svelte-1v5syb9">`);
						Copy($$renderer, { class: 'action-icon' });
						$$renderer.push(`<!----> Copy</button> <button class="edra-btn h-8-btn text-xs-btn svelte-1v5syb9">`);
						RotateCcw($$renderer, { class: 'action-icon' });
						$$renderer.push(`<!----> Retry</button> <button class="edra-btn edra-btn-destructive h-8-btn text-xs-btn svelte-1v5syb9">`);
						Trash2($$renderer, { class: 'action-icon' });
						$$renderer.push(`<!----> Discard</button></div>`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}