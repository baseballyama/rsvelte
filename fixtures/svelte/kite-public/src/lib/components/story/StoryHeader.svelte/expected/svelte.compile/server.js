import * as $ from 'svelte/internal/server';
import { IconCards, IconDownload, IconSparkles, IconVolume } from '@tabler/icons-svelte';
import { getContext } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import { experimental } from '$lib/stores/experimental.svelte.js';
import { sections } from '$lib/stores/sections.svelte.js';
import { language } from '$lib/stores/language.svelte';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { containsCJK } from '$lib/utils/textUtils';
import { extractStoryText } from '$lib/utils/storyTextExtractor';
import Tooltip from '../Tooltip.svelte';

export default function StoryHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			story,
			isRead = false,
			isSharedView = false,
			isExpanded = false,
			onTitleClick,
			onReadClick,
			onFlashcardsClick,
			onExportClick,
			onDownloadClick,
			onTtsClick,
			onTtsDownloadClick,
			onSimplifyLevelSelect,
			citationMapping,
			isSimplifying = false,
			selectedLevel = null,
			flashcardMode = false,
			isExporting = false,
			exportedCSV = null,
			selectedWordsCount = 0,
			ttsStatus = 'idle'
		} = $$props;

		// Toggle state for showing/hiding reading level buttons
		let showSimplifySelector = false;

		function handleSimplifyToggle() {
			showSimplifySelector = !showSimplifySelector;
		}

		// Get session from context
		const session = getContext('session');

		// Check if user is a subscriber
		const isSubscriber = $.derived(() => session?.subscription === true);

		// Check if user is logged in (for assistant feature)
		const isLoggedIn = $.derived(() => session?.loggedIn === true);

		// Assistant input state
		let showAssistantInput = false;

		let assistantQuestion = '';

		// Maximum safe URL length for browsers
		const MAX_URL_LENGTH = 2000;

		// Get user's interface language name for assistant prompt
		function getUserLanguageName() {
			const locale = language.currentLocale || 'en';

			try {
				const displayNames = new Intl.DisplayNames([locale], { type: 'language' });

				return displayNames.of(locale) || 'English';
			} catch {
				return 'English';
			}
		}

		// Build the assistant query, truncating story text to fit the user's question + context within URL limit
		function buildAssistantUrl(userQuestion) {
			const userLanguageName = getUserLanguageName();
			const userLocale = language.currentLocale || 'en';
			const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
			const suffix = `\n\nThis is a news story from Kagi News, reported on ${today}. Please respond in the same language as the user's question.\n\nUser's question: ${userQuestion}`;
			const prefix = 'News story:\n\n';
			const enabledSections = sections.list.filter((sec) => sec.enabled).sort((a, b) => a.order - b.order);
			const fullText = extractStoryText(story, enabledSections);
			const baseUrl = 'https://kagi.com/assistant?q=';
			let text = fullText;

			while (text.length > 0) {
				const query = `${prefix}${text}${suffix}`;
				const url = `${baseUrl}${encodeURIComponent(query)}`;

				if (url.length <= MAX_URL_LENGTH) return url;

				// Truncate to ~80% and snap to last sentence boundary
				const targetLen = Math.floor(text.length * 0.8);

				const truncated = text.slice(0, targetLen);
				const lastSentence = truncated.lastIndexOf('. ');

				text = lastSentence > 0
					? truncated.slice(0, lastSentence + 1)
					: truncated.trimEnd();

				if (text.length === fullText.length) break;
			}

			return `${baseUrl}${encodeURIComponent(`News topic: ${story.title}${suffix}`)}`;
		}

		// Submit question to Kagi Assistant
		function submitAssistantQuestion() {
			const question = assistantQuestion.trim();

			if (!question) return;

			window.open(buildAssistantUrl(question), '_blank', 'noopener,noreferrer');
			assistantQuestion = '';
			showAssistantInput = false;
		}

		// Define colors ordered by perceptual distinctness
		// These are maximally distinct colors that work well together
		const DISTINCT_COLORS = [
			{ name: 'red', light: '#e74c3c', dark: '#ff6b6b' },
			{ name: 'blue', light: '#3498db', dark: '#74b9ff' },
			{ name: 'green', light: '#2ecc71', dark: '#55efc4' },
			{ name: 'purple', light: '#9b59b6', dark: '#a29bfe' },
			{ name: 'orange', light: '#f39c12', dark: '#fdcb6e' },
			{ name: 'teal', light: '#1abc9c', dark: '#00cec9' },
			{ name: 'pink', light: '#e91e63', dark: '#fd79a8' },
			{ name: 'indigo', light: '#3f51b5', dark: '#7986cb' },
			{ name: 'amber', light: '#ff9800', dark: '#ffb74d' }
		];

		// Generate topic color class using a smarter selection algorithm
		function getTopicColorClass(category) {
			// Create a simple hash from the category string
			let hash = 0;

			for (let i = 0; i < category.length; i++) {
				const char = category.charCodeAt(i);

				hash = (hash << 5) - hash + char;
				hash = hash & hash; // Convert to 32-bit integer
			}

			// Use the hash to select from our distinct colors
			const colorIndex = Math.abs(hash) % DISTINCT_COLORS.length;

			return `topic-color-${colorIndex}`;
		}

		// Get emoji from story data when experimental settings are enabled
		const categoryEmoji = $.derived(() => experimental.showCategoryIcons ? story.emoji : '');

		const articleEmoji = $.derived(() => experimental.showArticleIcons ? story.emoji : '');

		// Convert title citations to numbered format if mapping is available
		const displayTitle = $.derived(() => {
			if (!citationMapping) return story.title;

			return replaceWithNumberedCitations(story.title, citationMapping);
		});

		// Check if story contains CJK characters (flashcards don't work for CJK)
		const isCJKStory = $.derived(() => containsCJK(story.title));

		if (!isSharedView) {
			$$renderer.push(`<!--[0--><header class="mb-1 flex items-center justify-between"><div class="flex items-center gap-2"><div class="category-label inline-flex items-center rounded py-1 text-xs text-gray-700 dark:text-gray-300 uppercase" role="heading" aria-level="3"${$.attr('aria-label', `Category: ${$.stringify(story.category)}`)}>`);

			if (categoryEmoji()) {
				$$renderer.push(`<!--[0--><span aria-hidden="true" class="me-1">${$.escape(categoryEmoji())}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <span${$.attr_class($.clsx(getTopicColorClass(story.category)))} dir="auto">${$.escape(story.category)}</span></div> `);

			if (isExpanded && isSubscriber()) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-1">`);

				Tooltip($$renderer, {
					text: selectedLevel
						? s('story.simplify.tooltipActive').replace('{level}', selectedLevel)
						: s('story.simplify.tooltip'),
					position: 'bottom',
					children: ($$renderer) => {
						$$renderer.push(`<button${$.attr('disabled', isSimplifying, true)} class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Toggle simplify options"${$.attr('aria-expanded', showSimplifySelector)}>`);

						IconSparkles($$renderer, {
							size: 16,
							class: selectedLevel ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
						});

						$$renderer.push(`<!----></button>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (showSimplifySelector) {
					$$renderer.push(`<!--[0--><div role="group" aria-label="Reading level options" class="flex items-center gap-1"><button${$.attr('disabled', isSimplifying, true)}${$.attr_class($.clsx(selectedLevel === 'very-simple'
						? 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
						: 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'))} aria-label="Very simple reading level"${$.attr('aria-pressed', selectedLevel === 'very-simple')}>${$.escape(s('story.simplify.verySimple'))}</button> <button${$.attr('disabled', isSimplifying, true)}${$.attr_class($.clsx(selectedLevel === 'simple'
						? 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
						: 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'))} aria-label="Simple reading level"${$.attr('aria-pressed', selectedLevel === 'simple')}>${$.escape(s('story.simplify.simple'))}</button> <button${$.attr('disabled', isSimplifying, true)}${$.attr_class($.clsx(selectedLevel === 'normal'
						? 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
						: 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'))} aria-label="Normal reading level"${$.attr('aria-pressed', selectedLevel === 'normal')}>${$.escape(s('story.simplify.normal'))}</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (!isCJKStory()) {
					$$renderer.push('<!--[0-->');

					if (exportedCSV) {
						$$renderer.push('<!--[0-->');

						Tooltip($$renderer, {
							text: s('story.flashcards.downloadTooltip'),
							position: 'bottom',
							children: ($$renderer) => {
								$$renderer.push(`<button class="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all flex items-center gap-1.5 text-xs font-medium" aria-label="Download flashcards CSV">`);
								IconCards($$renderer, { size: 16, class: 'text-blue-600 dark:text-blue-300' });
								$$renderer.push(`<!----> ${$.escape(s('story.flashcards.download'))}</button>`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Tooltip($$renderer, {
							text: flashcardMode
								? s('story.flashcards.tooltipExit')
								: s('story.flashcards.tooltip'),
							position: 'bottom',
							children: ($$renderer) => {
								$$renderer.push(`<button${$.attr('disabled', isExporting, true)}${$.attr_class(`transition-all rounded flex items-center gap-1.5 ${flashcardMode
									? 'px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
									: 'p-1 hover:bg-gray-100 dark:hover:bg-gray-800'} ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`)}${$.attr('aria-label', flashcardMode
									? s('story.flashcards.tooltipExit')
									: s('story.flashcards.tooltip'))}>`);

								IconCards($$renderer, {
									size: 16,
									class: flashcardMode
										? "text-blue-600 dark:text-blue-300"
										: "text-gray-500 dark:text-gray-400"
								});

								$$renderer.push(`<!----> `);

								if (flashcardMode) {
									$$renderer.push(`<!--[0--><span class="text-xs font-medium">${$.escape(selectedWordsCount > 0
										? s('story.flashcards.selectedCount').replace('{count}', String(selectedWordsCount))
										: s('story.flashcards.selectWords'))}</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></button>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (flashcardMode && selectedWordsCount > 0 && !isExporting) {
							$$renderer.push('<!--[0-->');

							Tooltip($$renderer, {
								text: s('story.flashcards.exportTooltip'),
								position: 'bottom',
								children: ($$renderer) => {
									$$renderer.push(`<button class="px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-all flex items-center text-xs font-medium" aria-label="Export selected words to Anki">${$.escape(s('story.flashcards.export'))}</button>`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (isExporting) {
							$$renderer.push(`<!--[0--><div class="flex items-center gap-2 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 ml-1" role="status" aria-live="polite"><svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>${$.escape(s('story.flashcards.generating'))}</span></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (ttsStatus === 'loading') {
					$$renderer.push('<!--[0-->');

					Tooltip($$renderer, {
						text: s('story.tts.tooltipLoading'),
						position: 'bottom',
						children: ($$renderer) => {
							$$renderer.push(`<button class="p-1 rounded bg-gray-100 dark:bg-gray-800 transition-colors" aria-label="Cancel audio loading"><svg class="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></button>`);
						},
						$$slots: { default: true }
					});
				} else if (ttsStatus === 'playing') {
					$$renderer.push('<!--[1-->');

					Tooltip($$renderer, {
						text: s('story.tts.tooltipStop'),
						position: 'bottom',
						children: ($$renderer) => {
							$$renderer.push(`<button class="p-1 rounded bg-blue-100 dark:bg-blue-900 transition-colors" aria-label="Stop audio playback">`);
							IconVolume($$renderer, { size: 16, class: 'text-blue-600 dark:text-blue-300' });
							$$renderer.push(`<!----></button>`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');

					Tooltip($$renderer, {
						text: s('story.tts.tooltip'),
						position: 'bottom',
						children: ($$renderer) => {
							$$renderer.push(`<button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Read story aloud">`);
							IconVolume($$renderer, { size: 16, class: 'text-gray-500 dark:text-gray-400' });
							$$renderer.push(`<!----></button>`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--> `);

				if (isLoggedIn()) {
					$$renderer.push('<!--[0-->');

					Tooltip($$renderer, {
						text: s('story.assistant.tooltip'),
						position: 'bottom',
						children: ($$renderer) => {
							$$renderer.push(`<button${$.attr_class(`transition-all rounded flex items-center gap-1.5 ${showAssistantInput
								? 'px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
								: 'p-1 hover:bg-gray-100 dark:hover:bg-gray-800'}`)}${$.attr('aria-label', s('story.assistant.tooltip'))}${$.attr('aria-expanded', showAssistantInput)} type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"${$.attr_class($.clsx(showAssistantInput
								? "text-blue-600 dark:text-blue-300"
								: "text-gray-500 dark:text-gray-400"))}><circle cx="12" cy="12" r="11.25"></circle><circle cx="12" cy="12" r="7.75"></circle><path d="M19.2 14.9c-1.1.5-2.1 1.1-4.2 1.1-4 0-5-3-8.5-3-.9 0-1.6.1-2.1.3m15-3.5c-1.1.5-2.1 1.2-4.4 1.2-4 0-5-3-8.5-3-.4 0-.8 0-1.2.1"></path></svg> `);

							if (showAssistantInput) {
								$$renderer.push(`<!--[0--><span class="text-xs font-medium">${$.escape(s('story.assistant.tooltip'))}</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></button>`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (isSimplifying) {
					$$renderer.push(`<!--[0--><div class="flex items-center gap-2 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 ml-1" role="status" aria-live="polite"><svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>${$.escape(s('story.simplify.loading'))}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></header>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex items-start"><div class="flex-grow"><button${$.attr_class('dark:text-dark-text mb-2 flex cursor-pointer items-center text-xl text-gray-800 text-start w-full bg-transparent border-none p-0 focus-visible-ring rounded', void 0, { 'font-semibold': !isRead })} aria-label="Expand story" aria-expanded="false">`);

		if (articleEmoji()) {
			$$renderer.push(`<!--[0--><span aria-hidden="true" class="me-2">${$.escape(articleEmoji())}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span dir="auto">${$.escape(displayTitle())}</span></button></div> `);

		if (!isSharedView) {
			$$renderer.push(`<!--[0--><div class="-mt-3 ms-4 flex-shrink-0"><button class="focus-visible-ring rounded"${$.attr('title', s("article.readStatus") || "Mark as read")}${$.attr('aria-label', isRead ? "Mark as unread" : "Mark as read")}><svg${$.attr_class('h-6 w-6', void 0, {
				'text-blue-500': isRead,
				'text-gray-300': !isRead,
				'dark:text-gray-600': !isRead
			})} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19"${$.attr('fill', isRead ? "#7BA3FF" : "currentColor")}${$.attr('stroke', isRead ? "#427AFC" : "none")}><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (showAssistantInput && isLoggedIn() && isExpanded) {
			$$renderer.push(`<!--[0--><form class="flex items-center gap-2 mb-2"><input type="text"${$.attr('value', assistantQuestion)}${$.attr('placeholder', s('story.assistant.placeholder'))} class="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" autofocus=""/> <button type="submit"${$.attr('disabled', !assistantQuestion.trim(), true)} class="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-medium">${$.escape(s('story.assistant.submit'))}</button></form>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}