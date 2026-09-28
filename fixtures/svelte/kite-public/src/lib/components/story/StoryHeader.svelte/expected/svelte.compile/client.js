import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span aria-hidden="true" class="me-1"> </span>`);
var root_1 = $.from_html(`<button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Toggle simplify options"><!></button>`);
var root_2 = $.from_html(`<div role="group" aria-label="Reading level options" class="flex items-center gap-1"><button aria-label="Very simple reading level"> </button> <button aria-label="Simple reading level"> </button> <button aria-label="Normal reading level"> </button></div>`);
var root_3 = $.from_html(`<button class="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all flex items-center gap-1.5 text-xs font-medium" aria-label="Download flashcards CSV"><!> </button>`);
var root_4 = $.from_html(`<span class="text-xs font-medium"> </span>`);
var root_5 = $.from_html(`<button><!> <!></button>`);
var root_6 = $.from_html(`<button class="px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-all flex items-center text-xs font-medium" aria-label="Export selected words to Anki"> </button>`);
var root_7 = $.from_html(`<div class="flex items-center gap-2 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 ml-1" role="status" aria-live="polite"><svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span> </span></div>`);
var root_8 = $.from_html(`<!> <!> <!>`, 1);
var root_9 = $.from_html(`<button class="p-1 rounded bg-gray-100 dark:bg-gray-800 transition-colors" aria-label="Cancel audio loading"><svg class="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></button>`);
var root_10 = $.from_html(`<button class="p-1 rounded bg-blue-100 dark:bg-blue-900 transition-colors" aria-label="Stop audio playback"><!></button>`);
var root_11 = $.from_html(`<button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Read story aloud"><!></button>`);
var root_12 = $.from_html(`<button type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11.25"></circle><circle cx="12" cy="12" r="7.75"></circle><path d="M19.2 14.9c-1.1.5-2.1 1.1-4.2 1.1-4 0-5-3-8.5-3-.9 0-1.6.1-2.1.3m15-3.5c-1.1.5-2.1 1.2-4.4 1.2-4 0-5-3-8.5-3-.4 0-.8 0-1.2.1"></path></svg> <!></button>`);
var root_13 = $.from_html(`<div class="flex items-center gap-1"><!> <!> <!> <!> <!> <!></div>`);
var root_14 = $.from_html(`<header class="mb-1 flex items-center justify-between"><div class="flex items-center gap-2"><div class="category-label inline-flex items-center rounded py-1 text-xs text-gray-700 dark:text-gray-300 uppercase" role="heading" aria-level="3"><!> <span dir="auto"> </span></div> <!></div></header>`);
var root_15 = $.from_html(`<span aria-hidden="true" class="me-2"> </span>`);
var root_16 = $.from_html(`<div class="-mt-3 ms-4 flex-shrink-0"><button class="focus-visible-ring rounded"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></button></div>`);
var root_17 = $.from_html(`<form class="flex items-center gap-2 mb-2"><input type="text" class="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/> <button type="submit" class="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-medium"> </button></form>`);
var root_18 = $.from_html(`<!> <div class="flex items-start"><div class="flex-grow"><button aria-label="Expand story" aria-expanded="false"><!> <span dir="auto"> </span></button></div> <!></div> <!>`, 1);

export default function StoryHeader($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let isRead = $.prop($$props, 'isRead', 3, false),
		isSharedView = $.prop($$props, 'isSharedView', 3, false),
		isExpanded = $.prop($$props, 'isExpanded', 3, false),
		isSimplifying = $.prop($$props, 'isSimplifying', 3, false),
		selectedLevel = $.prop($$props, 'selectedLevel', 3, null),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		isExporting = $.prop($$props, 'isExporting', 3, false),
		exportedCSV = $.prop($$props, 'exportedCSV', 3, null),
		selectedWordsCount = $.prop($$props, 'selectedWordsCount', 3, 0),
		ttsStatus = $.prop($$props, 'ttsStatus', 3, 'idle');

	// Toggle state for showing/hiding reading level buttons
	let showSimplifySelector = $.state(false);

	function handleSimplifyToggle() {
		$.set(showSimplifySelector, !$.get(showSimplifySelector));
	}

	// Get session from context
	const session = getContext('session');

	// Check if user is a subscriber
	const isSubscriber = $.derived(() => session?.subscription === true);

	// Check if user is logged in (for assistant feature)
	const isLoggedIn = $.derived(() => session?.loggedIn === true);

	// Assistant input state
	let showAssistantInput = $.state(false);

	let assistantQuestion = $.state('');

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
		const fullText = extractStoryText($$props.story, enabledSections);
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

		return `${baseUrl}${encodeURIComponent(`News topic: ${$$props.story.title}${suffix}`)}`;
	}

	// Submit question to Kagi Assistant
	function submitAssistantQuestion() {
		const question = $.get(assistantQuestion).trim();

		if (!question) return;

		window.open(buildAssistantUrl(question), '_blank', 'noopener,noreferrer');
		$.set(assistantQuestion, '');
		$.set(showAssistantInput, false);
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
	const categoryEmoji = $.derived(() => experimental.showCategoryIcons ? $$props.story.emoji : '');

	const articleEmoji = $.derived(() => experimental.showArticleIcons ? $$props.story.emoji : '');

	// Convert title citations to numbered format if mapping is available
	const displayTitle = $.derived(() => {
		if (!$$props.citationMapping) return $$props.story.title;

		return replaceWithNumberedCitations($$props.story.title, $$props.citationMapping);
	});

	// Check if story contains CJK characters (flashcards don't work for CJK)
	const isCJKStory = $.derived(() => containsCJK($$props.story.title));

	var fragment = root_18();
	var node = $.first_child(fragment);

	{
		var consequent_13 = ($$anchor) => {
			var header = root_14();
			var div = $.child(header);
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text_1 = $.only_child(span, true);

					$.template_effect(() => $.set_text(text_1, $.get(categoryEmoji)));
					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if ($.get(categoryEmoji)) $$render(consequent);
				});
			}

			var span_1 = $.sibling(node_1, 2);
			var text_2 = $.only_child(span_1, true);

			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			{
				var consequent_12 = ($$anchor) => {
					var div_2 = root_13();
					var node_3 = $.child(div_2);

					{
						let $0 = $.derived(() => selectedLevel()
							? s('story.simplify.tooltipActive').replace('{level}', selectedLevel())
							: s('story.simplify.tooltip'));

						Tooltip(node_3, {
							get text() {
								return $.get($0);
							},
							position: 'bottom',
							children: ($$anchor, $$slotProps) => {
								var button = root_1();
								var node_4 = $.child(button);

								{
									let $0 = $.derived(() => selectedLevel() ? "text-blue-500" : "text-gray-500 dark:text-gray-400");

									IconSparkles(node_4, {
										size: 16,
										get class() {
											return $.get($0);
										}
									});
								}

								$.reset(button);

								$.template_effect(() => {
									button.disabled = isSimplifying();
									$.set_attribute(button, 'aria-expanded', $.get(showSimplifySelector));
								});

								$.delegated('click', button, handleSimplifyToggle);
								$.append($$anchor, button);
							},
							$$slots: { default: true }
						});
					}

					var node_5 = $.sibling(node_3, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_3 = root_2();
							var button_1 = $.child(div_3);
							var text_3 = $.only_child(button_1, true);
							var button_2 = $.sibling(button_1, 2);
							var text_4 = $.only_child(button_2, true);
							var button_3 = $.sibling(button_2, 2);
							var text_5 = $.only_child(button_3, true);

							$.reset(div_3);

							$.template_effect(
								($0, $1, $2) => {
									button_1.disabled = isSimplifying();

									$.set_class(button_1, 1, $.clsx(selectedLevel() === 'very-simple'
										? 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
										: 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'));

									$.set_attribute(button_1, 'aria-pressed', selectedLevel() === 'very-simple');
									$.set_text(text_3, $0);
									button_2.disabled = isSimplifying();

									$.set_class(button_2, 1, $.clsx(selectedLevel() === 'simple'
										? 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
										: 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'));

									$.set_attribute(button_2, 'aria-pressed', selectedLevel() === 'simple');
									$.set_text(text_4, $1);
									button_3.disabled = isSimplifying();

									$.set_class(button_3, 1, $.clsx(selectedLevel() === 'normal'
										? 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
										: 'px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'));

									$.set_attribute(button_3, 'aria-pressed', selectedLevel() === 'normal');
									$.set_text(text_5, $2);
								},
								[
									() => s('story.simplify.verySimple'),
									() => s('story.simplify.simple'),
									() => s('story.simplify.normal')
								]
							);

							$.delegated('click', button_1, () => $$props.onSimplifyLevelSelect?.('very-simple'));
							$.delegated('click', button_2, () => $$props.onSimplifyLevelSelect?.('simple'));
							$.delegated('click', button_3, () => $$props.onSimplifyLevelSelect?.('normal'));
							$.append($$anchor, div_3);
						};

						$.if(node_5, ($$render) => {
							if ($.get(showSimplifySelector)) $$render(consequent_1);
						});
					}

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_1 = $.comment();
							var node_7 = $.first_child(fragment_1);

							{
								var consequent_2 = ($$anchor) => {
									{
										let $0 = $.derived(() => s('story.flashcards.downloadTooltip'));

										Tooltip($$anchor, {
											get text() {
												return $.get($0);
											},
											position: 'bottom',
											children: ($$anchor, $$slotProps) => {
												var button_4 = root_3();
												var node_8 = $.child(button_4);

												IconCards(node_8, { size: 16, class: 'text-blue-600 dark:text-blue-300' });

												var text_6 = $.sibling(node_8);

												$.reset(button_4);
												$.template_effect(($0) => $.set_text(text_6, ` ${$0 ?? ''}`), [() => s('story.flashcards.download')]);

												$.delegated('click', button_4, function (...$$args) {
													$$props.onDownloadClick?.apply(this, $$args);
												});

												$.append($$anchor, button_4);
											},
											$$slots: { default: true }
										});
									}
								};

								var alternate = ($$anchor) => {
									var fragment_3 = root_8();
									var node_9 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => flashcardMode()
											? s('story.flashcards.tooltipExit')
											: s('story.flashcards.tooltip'));

										Tooltip(node_9, {
											get text() {
												return $.get($0);
											},
											position: 'bottom',
											children: ($$anchor, $$slotProps) => {
												var button_5 = root_5();
												var node_10 = $.child(button_5);

												{
													let $0 = $.derived(() => flashcardMode()
														? "text-blue-600 dark:text-blue-300"
														: "text-gray-500 dark:text-gray-400");

													IconCards(node_10, {
														size: 16,
														get class() {
															return $.get($0);
														}
													});
												}

												var node_11 = $.sibling(node_10, 2);

												{
													var consequent_3 = ($$anchor) => {
														var span_2 = root_4();
														var text_7 = $.only_child(span_2, true);

														$.template_effect(($0) => $.set_text(text_7, $0), [
															() => selectedWordsCount() > 0
																? s('story.flashcards.selectedCount').replace('{count}', String(selectedWordsCount()))
																: s('story.flashcards.selectWords')
														]);

														$.append($$anchor, span_2);
													};

													$.if(node_11, ($$render) => {
														if (flashcardMode()) $$render(consequent_3);
													});
												}

												$.reset(button_5);

												$.template_effect(
													($0) => {
														button_5.disabled = isExporting();

														$.set_class(button_5, 1, `transition-all rounded flex items-center gap-1.5 ${flashcardMode()
															? 'px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
															: 'p-1 hover:bg-gray-100 dark:hover:bg-gray-800'} ${isExporting() ? 'opacity-50 cursor-not-allowed' : ''}`);

														$.set_attribute(button_5, 'aria-label', $0);
													},
													[
														() => flashcardMode()
															? s('story.flashcards.tooltipExit')
															: s('story.flashcards.tooltip')
													]
												);

												$.delegated('click', button_5, function (...$$args) {
													$$props.onFlashcardsClick?.apply(this, $$args);
												});

												$.append($$anchor, button_5);
											},
											$$slots: { default: true }
										});
									}

									var node_12 = $.sibling(node_9, 2);

									{
										var consequent_4 = ($$anchor) => {
											{
												let $0 = $.derived(() => s('story.flashcards.exportTooltip'));

												Tooltip($$anchor, {
													get text() {
														return $.get($0);
													},
													position: 'bottom',
													children: ($$anchor, $$slotProps) => {
														var button_6 = root_6();
														var text_8 = $.only_child(button_6, true);

														$.template_effect(($0) => $.set_text(text_8, $0), [() => s('story.flashcards.export')]);

														$.delegated('click', button_6, function (...$$args) {
															$$props.onExportClick?.apply(this, $$args);
														});

														$.append($$anchor, button_6);
													},
													$$slots: { default: true }
												});
											}
										};

										$.if(node_12, ($$render) => {
											if (flashcardMode() && selectedWordsCount() > 0 && !isExporting()) $$render(consequent_4);
										});
									}

									var node_13 = $.sibling(node_12, 2);

									{
										var consequent_5 = ($$anchor) => {
											var div_4 = root_7();
											var span_3 = $.sibling($.child(div_4), 2);
											var text_9 = $.only_child(span_3, true);

											$.reset(div_4);
											$.template_effect(($0) => $.set_text(text_9, $0), [() => s('story.flashcards.generating')]);
											$.append($$anchor, div_4);
										};

										$.if(node_13, ($$render) => {
											if (isExporting()) $$render(consequent_5);
										});
									}

									$.append($$anchor, fragment_3);
								};

								$.if(node_7, ($$render) => {
									if (exportedCSV()) $$render(consequent_2); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_1);
						};

						$.if(node_6, ($$render) => {
							if (!$.get(isCJKStory)) $$render(consequent_6);
						});
					}

					var node_14 = $.sibling(node_6, 2);

					{
						var consequent_7 = ($$anchor) => {
							{
								let $0 = $.derived(() => s('story.tts.tooltipLoading'));

								Tooltip($$anchor, {
									get text() {
										return $.get($0);
									},
									position: 'bottom',
									children: ($$anchor, $$slotProps) => {
										var button_7 = root_9();

										$.delegated('click', button_7, function (...$$args) {
											$$props.onTtsClick?.apply(this, $$args);
										});

										$.append($$anchor, button_7);
									},
									$$slots: { default: true }
								});
							}
						};

						var consequent_8 = ($$anchor) => {
							{
								let $0 = $.derived(() => s('story.tts.tooltipStop'));

								Tooltip($$anchor, {
									get text() {
										return $.get($0);
									},
									position: 'bottom',
									children: ($$anchor, $$slotProps) => {
										var button_8 = root_10();
										var node_15 = $.child(button_8);

										IconVolume(node_15, { size: 16, class: 'text-blue-600 dark:text-blue-300' });
										$.reset(button_8);

										$.delegated('click', button_8, function (...$$args) {
											$$props.onTtsClick?.apply(this, $$args);
										});

										$.append($$anchor, button_8);
									},
									$$slots: { default: true }
								});
							}
						};

						var alternate_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => s('story.tts.tooltip'));

								Tooltip($$anchor, {
									get text() {
										return $.get($0);
									},
									position: 'bottom',
									children: ($$anchor, $$slotProps) => {
										var button_9 = root_11();
										var node_16 = $.child(button_9);

										IconVolume(node_16, { size: 16, class: 'text-gray-500 dark:text-gray-400' });
										$.reset(button_9);

										$.delegated('click', button_9, function (...$$args) {
											$$props.onTtsClick?.apply(this, $$args);
										});

										$.append($$anchor, button_9);
									},
									$$slots: { default: true }
								});
							}
						};

						$.if(node_14, ($$render) => {
							if (ttsStatus() === 'loading') $$render(consequent_7); else if (ttsStatus() === 'playing') $$render(consequent_8, 1); else $$render(alternate_1, -1);
						});
					}

					var node_17 = $.sibling(node_14, 2);

					{
						var consequent_10 = ($$anchor) => {
							{
								let $0 = $.derived(() => s('story.assistant.tooltip'));

								Tooltip($$anchor, {
									get text() {
										return $.get($0);
									},
									position: 'bottom',
									children: ($$anchor, $$slotProps) => {
										var button_10 = root_12();
										var svg = $.child(button_10);
										var node_18 = $.sibling(svg, 2);

										{
											var consequent_9 = ($$anchor) => {
												var span_4 = root_4();
												var text_10 = $.only_child(span_4, true);

												$.template_effect(($0) => $.set_text(text_10, $0), [() => s('story.assistant.tooltip')]);
												$.append($$anchor, span_4);
											};

											$.if(node_18, ($$render) => {
												if ($.get(showAssistantInput)) $$render(consequent_9);
											});
										}

										$.reset(button_10);

										$.template_effect(
											($0) => {
												$.set_class(button_10, 1, `transition-all rounded flex items-center gap-1.5 ${$.get(showAssistantInput)
													? 'px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
													: 'p-1 hover:bg-gray-100 dark:hover:bg-gray-800'}`);

												$.set_attribute(button_10, 'aria-label', $0);
												$.set_attribute(button_10, 'aria-expanded', $.get(showAssistantInput));

												$.set_class(svg, 0, $.clsx($.get(showAssistantInput)
													? "text-blue-600 dark:text-blue-300"
													: "text-gray-500 dark:text-gray-400"));
											},
											[() => s('story.assistant.tooltip')]
										);

										$.delegated('click', button_10, () => $.set(showAssistantInput, !$.get(showAssistantInput)));
										$.append($$anchor, button_10);
									},
									$$slots: { default: true }
								});
							}
						};

						$.if(node_17, ($$render) => {
							if ($.get(isLoggedIn)) $$render(consequent_10);
						});
					}

					var node_19 = $.sibling(node_17, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_5 = root_7();
							var span_5 = $.sibling($.child(div_5), 2);
							var text_11 = $.only_child(span_5, true);

							$.reset(div_5);
							$.template_effect(($0) => $.set_text(text_11, $0), [() => s('story.simplify.loading')]);
							$.append($$anchor, div_5);
						};

						$.if(node_19, ($$render) => {
							if (isSimplifying()) $$render(consequent_11);
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_2, ($$render) => {
					if (isExpanded() && $.get(isSubscriber)) $$render(consequent_12);
				});
			}

			$.reset(div);
			$.reset(header);

			$.template_effect(
				($0) => {
					$.set_attribute(div_1, 'aria-label', `Category: ${$$props.story.category ?? ''}`);
					$.set_class(span_1, 1, $0);
					$.set_text(text_2, $$props.story.category);
					span_1.dir = span_1.dir;
				},
				[() => $.clsx(getTopicColorClass($$props.story.category))]
			);

			$.append($$anchor, header);
		};

		$.if(node, ($$render) => {
			if (!isSharedView()) $$render(consequent_13);
		});
	}

	var div_6 = $.sibling(node, 2);
	var div_7 = $.child(div_6);
	var button_11 = $.child(div_7);
	let classes;
	var node_20 = $.child(button_11);

	{
		var consequent_14 = ($$anchor) => {
			var span_6 = root_15();
			var text_12 = $.only_child(span_6, true);

			$.template_effect(() => $.set_text(text_12, $.get(articleEmoji)));
			$.append($$anchor, span_6);
		};

		$.if(node_20, ($$render) => {
			if ($.get(articleEmoji)) $$render(consequent_14);
		});
	}

	var span_7 = $.sibling(node_20, 2);
	var text_13 = $.only_child(span_7, true);

	$.reset(button_11);
	$.reset(div_7);

	var node_21 = $.sibling(div_7, 2);

	{
		var consequent_15 = ($$anchor) => {
			var div_8 = root_16();
			var button_12 = $.child(div_8);
			var svg_1 = $.child(button_12);
			let classes_1;

			$.reset(button_12);
			$.reset(div_8);

			$.template_effect(
				($0) => {
					$.set_attribute(button_12, 'title', $0);
					$.set_attribute(button_12, 'aria-label', isRead() ? "Mark as unread" : "Mark as read");

					classes_1 = $.set_class(svg_1, 0, 'h-6 w-6', null, classes_1, {
						'text-blue-500': isRead(),
						'text-gray-300': !isRead(),
						'dark:text-gray-600': !isRead()
					});

					$.set_attribute(svg_1, 'fill', isRead() ? "#7BA3FF" : "currentColor");
					$.set_attribute(svg_1, 'stroke', isRead() ? "#427AFC" : "none");
				},
				[() => s("article.readStatus") || "Mark as read"]
			);

			$.delegated('click', button_12, function (...$$args) {
				$$props.onReadClick?.apply(this, $$args);
			});

			$.append($$anchor, div_8);
		};

		$.if(node_21, ($$render) => {
			if (!isSharedView()) $$render(consequent_15);
		});
	}

	$.reset(div_6);

	var node_22 = $.sibling(div_6, 2);

	{
		var consequent_16 = ($$anchor) => {
			var form = root_17();
			var input = $.child(form);

			$.remove_input_defaults(input);
			$.autofocus(input, true);

			var button_13 = $.sibling(input, 2);
			var text_14 = $.only_child(button_13, true);

			$.reset(form);

			$.template_effect(
				($0, $1, $2) => {
					$.set_attribute(input, 'placeholder', $0);
					button_13.disabled = $1;
					$.set_text(text_14, $2);
				},
				[
					() => s('story.assistant.placeholder'),
					() => !$.get(assistantQuestion).trim(),
					() => s('story.assistant.submit')
				]
			);

			$.event('submit', form, (e) => {
				e.preventDefault();
				submitAssistantQuestion();
			});

			$.delegated('keydown', input, (e) => e.stopPropagation());
			$.bind_value(input, () => $.get(assistantQuestion), ($$value) => $.set(assistantQuestion, $$value));
			$.append($$anchor, form);
		};

		$.if(node_22, ($$render) => {
			if ($.get(showAssistantInput) && $.get(isLoggedIn) && isExpanded()) $$render(consequent_16);
		});
	}

	$.template_effect(() => {
		classes = $.set_class(button_11, 1, 'dark:text-dark-text mb-2 flex cursor-pointer items-center text-xl text-gray-800 text-start w-full bg-transparent border-none p-0 focus-visible-ring rounded', null, classes, { 'font-semibold': !isRead() });
		$.set_text(text_13, $.get(displayTitle));
		span_7.dir = span_7.dir;
	});

	$.delegated('click', button_11, function (...$$args) {
		$$props.onTitleClick?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);