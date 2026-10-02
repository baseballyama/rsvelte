import * as $ from 'svelte/internal/server';

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

export default function AI($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputTag = null;
		const editor = getEditor();
		let inputValue = '';
		let aiState = AIState.Idle;
		let aiResponse = '';
		let activeOptionIndex = 0;
		let generating = false;

		// Position tracking for inline editor streaming
		let originalFrom = 0;

		let aiContentFrom = 0;
		let aiContentTo = 0;
		let lastPrompt = '';
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

				aiState = AIState.Confirmation;
				await generateAIContent(prompt);
			} catch(error) {
				aiState = AIState.Idle;
				console.error(error);
				toast.error('Something went wrong! Check console.', { id });
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
				toast.error('Something went wrong! Check console.');
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
					toast.error('Something went wrong when calling AI.', { description: error.message });
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
				tr.addMark(aiContentFrom, aiContentTo, editor.state.schema.marks['ai-highlight'].create({ color: 'var(--color-muted)' }));
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
				toast.error('Unable to replace. Copy content and paste manually.');
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
			toast.success('Copied to clipboard');
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
				// If still generating, just mark for cleanup
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

			$$renderer.push(`<button${$.attr_class(
				`group/dropdown-menu-item relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden transition-colors select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive ${activeOptionIndex === idx
					? 'quick-action-active bg-accent text-accent-foreground'
					: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`,
				'svelte-1unrtp5'
			)}>`);

			if (Icon) {
				$$renderer.push('<!--[-->');
				Icon($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <span class="ml-2 flex-1 text-start font-medium svelte-1unrtp5">${$.escape(action.label)}</span> `);

			if (activeOptionIndex === idx) {
				$$renderer.push(`<!--[0--><span class="rounded-sm bg-muted/75 px-1 text-muted-foreground svelte-1unrtp5">Enter</span>`);
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
			class: 'absolute z-100 flex max-h-120 max-w-3xl flex-col rounded-lg bg-popover/75 p-0 backdrop-blur-2xl transition-[height] duration-500',
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
				if (aiState === AIState.Idle) {
					$$renderer.push(`<!--[0--><div class="flex w-xl flex-col overflow-hidden rounded-xl border shadow-2xl backdrop-blur-2xl svelte-1unrtp5"><form class="flex items-start px-3 py-3 svelte-1unrtp5"><textarea${$.attr('rows', 1)} placeholder="Ask AI anything..." class="h-auto max-h-40 w-full resize-none border-0 outline-hidden svelte-1unrtp5">`);

					const $$body = $.escape(inputValue);

					if ($$body) {
						$$renderer.push(`${$$body}`);
					} else {}

					$$renderer.push(`</textarea> `);

					Button($$renderer, {
						type: 'submit',
						size: 'icon-lg',
						class: 'rounded-full',
						children: ($$renderer) => {
							Send($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></form> `);

					if (isAIActive() && inputValue.trim()?.length === 0) {
						$$renderer.push(`<!--[0--><div class="flex max-h-72 flex-col overflow-y-auto p-1.5 svelte-1unrtp5"><!--[-->`);

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
						$$renderer.push(`<!--[0--><div class="animated-gradient-border rounded p-0.5 svelte-1unrtp5"><div class="flex items-center gap-2 rounded-md bg-popover p-1 svelte-1unrtp5">`);
						Sparkle($$renderer, { class: 'size-4!' });
						$$renderer.push(`<!----> <span class="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text font-semibold text-transparent svelte-1unrtp5">AI is writing</span> <div class="flex h-5 items-center space-x-0.5 svelte-1unrtp5"><!--[-->`);

						const each_array_1 = $.ensure_array_like(Array(3));

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let id = each_array_1[i];

							$$renderer.push(`<div${$.attr('data-ball-number', id)} class="dot h-1.25 w-1.25 rounded-full bg-primary svelte-1unrtp5"${$.attr_style('', { 'animation-delay': `${$.stringify(i * 160)}ms` })}></div>`);
						}

						$$renderer.push(`<!--]--> <span class="sr-only svelte-1unrtp5">Loading</span></div></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="flex items-center justify-between gap-2 rounded-lg border p-2 shadow-2xl svelte-1unrtp5">`);

						Button($$renderer, {
							size: 'sm',
							onclick: replaceSelection,
							children: ($$renderer) => {
								Check($$renderer, {});
								$$renderer.push(`<!----> Replace`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'outline',
							size: 'sm',
							onclick: insertNext,
							children: ($$renderer) => {
								CornerDownLeft($$renderer, {});
								$$renderer.push(`<!----> Insert`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'outline',
							size: 'sm',
							onclick: copyToClipboard,
							children: ($$renderer) => {
								Copy($$renderer, {});
								$$renderer.push(`<!----> Copy`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'outline',
							size: 'sm',
							onclick: retry,
							children: ($$renderer) => {
								RotateCcw($$renderer, {});
								$$renderer.push(`<!----> Retry`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'destructive',
							size: 'sm',
							onclick: discardChanges,
							children: ($$renderer) => {
								Trash2($$renderer, {});
								$$renderer.push(`<!----> Discard`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
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