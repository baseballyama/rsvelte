import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { parseStructuredText } from '$lib/utils/textParsing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<p class="mb-2 text-base font-bold text-gray-800 dark:text-gray-200 break-words" dir="auto"><!></p> <p class="mb-2 text-base text-gray-700 dark:text-gray-300" dir="auto"><!></p>`, 1);
var root_1 = $.from_html(`<p class="mb-2 text-base text-gray-700 dark:text-gray-300" dir="auto"><!></p>`);
var root_2 = $.from_html(`<span>•</span>`);
var root_3 = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="text-[#183FDC] hover:underline dark:text-[#5B89FF]" dir="auto"> </a> <!>`, 1);
var root_4 = $.from_html(`<div class="mt-2 text-sm text-gray-600 dark:text-gray-400"></div>`);
var root_5 = $.from_html(`<div class="w-52 shrink-0 rounded-lg bg-gray-100 p-4 dark:bg-gray-700"><!> <!></div>`);
var root_6 = $.from_html(`<div class="pointer-events-none absolute left-0 top-0 h-full w-8 bg-linear-to-r from-white to-transparent dark:from-gray-900 md:hidden" aria-hidden="true"></div>`);
var root_7 = $.from_html(`<button class="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 transition-opacity" aria-label="Scroll left"><svg class="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>`);
var root_8 = $.from_html(`<button class="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 transition-opacity" aria-label="Scroll right"><svg class="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>`);
var root_9 = $.from_html(`<div class="pointer-events-none absolute right-0 top-0 h-full w-8 bg-linear-to-l from-white to-transparent dark:from-gray-900 md:hidden" aria-hidden="true"></div>`);
var root_10 = $.from_html(`<section class="mt-6"><h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <div class="relative overflow-x-hidden"><div class="horizontal-scroll-container flex flex-row gap-3 overflow-x-scroll pb-4" role="region"></div> <!> <!> <!> <!></div></section>`);

export default function StoryPerspectives($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let perspectives = $.prop($$props, 'perspectives', 19, () => []),
		articles = $.prop($$props, 'articles', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Convert citations in perspectives if mapping is available
	const displayPerspectives = $.derived(() => {
		if (!$$props.citationMapping) return perspectives();

		return perspectives().map((p) => ({
			...p,
			text: replaceWithNumberedCitations(p.text, $$props.citationMapping)
		}));
	});

	// Helper function to detect if text contains citations
	function hasCitations(text) {
		if (!text) return false;

		// Match citations like [domain#position], [common], [1], [2], etc.
		const citationPattern = /\[([^\]]+)\]/g;

		return citationPattern.test(text);
	}

	// Touch handling for mobile
	let isScrolling = $.state(false);

	function handleTouchStart() {
		$.set(isScrolling, true);
	}

	function handleTouchEnd() {
		setTimeout(
			() => {
				$.set(isScrolling, false);
			},
			50
		);
	}

	const scrollFadeDuration = 150;

	// Scroll indicator state
	let scrollContainer = $.state(null);

	let canScrollLeft = $.state(false);
	let canScrollRight = $.state(false);

	function checkScrollability() {
		if (!$.get(scrollContainer)) return;

		const { scrollLeft, scrollWidth, clientWidth } = $.get(scrollContainer);

		$.set(canScrollLeft, scrollLeft > 10);
		$.set(canScrollRight, scrollWidth - scrollLeft - clientWidth > 10);
	}

	function scrollBy(direction) {
		if (!$.get(scrollContainer)) return;

		// Get the actual card width + gap from the first card
		const firstCard = $.get(scrollContainer).querySelector(':scope > div');

		if (!firstCard) return;

		const cardWidth = firstCard.offsetWidth;
		const gap = 12; // gap-3 = 0.75rem = 12px
		const scrollAmount = cardWidth + gap;

		$.get(scrollContainer).scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth'
		});
	}

	$.user_effect(() => {
		if ($.get(scrollContainer)) {
			checkScrollability();

			// Also check on resize
			const resizeObserver = new ResizeObserver(checkScrollability);

			resizeObserver.observe($.get(scrollContainer));

			return () => resizeObserver.disconnect();
		}
	});

	var section = root_10();
	var h3 = $.child(section);
	var text_1 = $.only_child(h3, true);
	var div = $.sibling(h3, 2);
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $.get(displayPerspectives), $.index, ($$anchor, perspective) => {
		const parsed = $.derived(() => parseStructuredText($.get(perspective).text));
		var div_2 = root_5();
		var node = $.child(div_2);

		{
			var consequent_2 = ($$anchor) => {
				const titleCitations = $.derived(() => getCitedArticlesForText($.get(parsed).title, $$props.citationMapping, articles()));
				const contentCitations = $.derived(() => getCitedArticlesForText($.get(parsed).content, $$props.citationMapping, articles()));
				var fragment = root();
				var p_1 = $.first_child(fragment);
				var node_1 = $.child(p_1);

				{
					var consequent = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(parsed).title;
							},

							get flashcardMode() {
								return flashcardMode();
							},

							get selectedWords() {
								return selectedWords();
							},

							get shouldJiggle() {
								return shouldJiggle();
							},

							get onWordClick() {
								return $$props.onWordClick;
							},
							section: 'perspectives'
						});
					};

					var alternate = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(parsed).title;
							},
							showFavicons: false,
							showNumbers: false,
							inline: true,
							get articles() {
								return $.get(titleCitations).citedArticles;
							},

							get citationMapping() {
								return $$props.citationMapping;
							},

							get storyLocalizer() {
								return storyLocalizer();
							}
						});
					};

					$.if(node_1, ($$render) => {
						if (flashcardMode()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(p_1);

				var p_2 = $.sibling(p_1, 2);
				var node_2 = $.child(p_2);

				{
					var consequent_1 = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(parsed).content;
							},

							get flashcardMode() {
								return flashcardMode();
							},

							get selectedWords() {
								return selectedWords();
							},

							get shouldJiggle() {
								return shouldJiggle();
							},

							get onWordClick() {
								return $$props.onWordClick;
							},
							section: 'perspectives'
						});
					};

					var alternate_1 = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(parsed).content;
							},
							showFavicons: false,
							showNumbers: false,
							inline: true,
							get articles() {
								return $.get(contentCitations).citedArticles;
							},

							get citationMapping() {
								return $$props.citationMapping;
							},

							get storyLocalizer() {
								return storyLocalizer();
							}
						});
					};

					$.if(node_2, ($$render) => {
						if (flashcardMode()) $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				$.reset(p_2);

				$.template_effect(() => {
					p_1.dir = p_1.dir;
					p_2.dir = p_2.dir;
				});

				$.append($$anchor, fragment);
			};

			var alternate_3 = ($$anchor) => {
				const contentCitations = $.derived(() => getCitedArticlesForText($.get(parsed).content, $$props.citationMapping, articles()));
				var p_3 = root_1();
				var node_3 = $.child(p_3);

				{
					var consequent_3 = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(parsed).content;
							},

							get flashcardMode() {
								return flashcardMode();
							},

							get selectedWords() {
								return selectedWords();
							},

							get shouldJiggle() {
								return shouldJiggle();
							},

							get onWordClick() {
								return $$props.onWordClick;
							},
							section: 'perspectives'
						});
					};

					var alternate_2 = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(parsed).content;
							},
							showFavicons: false,
							showNumbers: false,
							inline: true,
							get articles() {
								return $.get(contentCitations).citedArticles;
							},

							get citationMapping() {
								return $$props.citationMapping;
							},

							get storyLocalizer() {
								return storyLocalizer();
							}
						});
					};

					$.if(node_3, ($$render) => {
						if (flashcardMode()) $$render(consequent_3); else $$render(alternate_2, -1);
					});
				}

				$.reset(p_3);
				$.template_effect(() => p_3.dir = p_3.dir);
				$.append($$anchor, p_3);
			};

			$.if(node, ($$render) => {
				if ($.get(parsed).hasTitle) $$render(consequent_2); else $$render(alternate_3, -1);
			});
		}

		var node_4 = $.sibling(node, 2);

		{
			var consequent_5 = ($$anchor) => {
				var div_3 = root_4();

				$.each(div_3, 21, () => $.get(perspective).sources, $.index, ($$anchor, source, idx) => {
					var fragment_7 = root_3();
					var a = $.first_child(fragment_7);
					var text_2 = $.only_child(a, true);
					var node_5 = $.sibling(a, 2);

					{
						var consequent_4 = ($$anchor) => {
							var span = root_2();

							$.append($$anchor, span);
						};

						$.if(node_5, ($$render) => {
							if (idx < $.get(perspective).sources.length - 1) $$render(consequent_4);
						});
					}

					$.template_effect(() => {
						$.set_attribute(a, 'href', $.get(source).url);
						$.set_text(text_2, $.get(source).name);
						a.dir = a.dir;
					});

					$.append($$anchor, fragment_7);
				});

				$.reset(div_3);
				$.append($$anchor, div_3);
			};

			var d = $.derived(() => $.get(perspective).sources && $.get(perspective).sources.length > 0 && !hasCitations($.get(perspective).text));

			$.if(node_4, ($$render) => {
				if ($.get(d)) $$render(consequent_5);
			});
		}

		$.reset(div_2);
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(scrollContainer, $$value), () => $.get(scrollContainer));

	var node_6 = $.sibling(div_1, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_4 = root_6();

			$.transition(3, div_4, () => fade, () => ({ duration: scrollFadeDuration }));
			$.append($$anchor, div_4);
		};

		$.if(node_6, ($$render) => {
			if ($.get(canScrollLeft)) $$render(consequent_6);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_7 = ($$anchor) => {
			var button = root_7();

			$.delegated('click', button, () => scrollBy('left'));
			$.transition(3, button, () => fade, () => ({ duration: scrollFadeDuration }));
			$.append($$anchor, button);
		};

		$.if(node_7, ($$render) => {
			if ($.get(canScrollLeft)) $$render(consequent_7);
		});
	}

	var node_8 = $.sibling(node_7, 2);

	{
		var consequent_8 = ($$anchor) => {
			var button_1 = root_8();

			$.delegated('click', button_1, () => scrollBy('right'));
			$.transition(3, button_1, () => fade, () => ({ duration: scrollFadeDuration }));
			$.append($$anchor, button_1);
		};

		$.if(node_8, ($$render) => {
			if ($.get(canScrollRight)) $$render(consequent_8);
		});
	}

	var node_9 = $.sibling(node_8, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_5 = root_9();

			$.transition(3, div_5, () => fade, () => ({ duration: scrollFadeDuration }));
			$.append($$anchor, div_5);
		};

		$.if(node_9, ($$render) => {
			if ($.get(canScrollRight)) $$render(consequent_9);
		});
	}

	$.reset(div);
	$.reset(section);

	$.template_effect(
		($0, $1) => {
			$.set_text(text_1, $0);
			$.set_attribute(div_1, 'aria-label', $1);
		},
		[
			() => storyLocalizer()("section.perspectives") || "Perspectives",
			() => storyLocalizer()("section.perspectives.carousel") || "Perspectives carousel - use arrow keys or swipe to navigate"
		]
	);

	$.delegated('touchstart', div_1, handleTouchStart, void 0, true);
	$.delegated('touchend', div_1, handleTouchEnd);
	$.event('scroll', div_1, checkScrollability);
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['touchstart', 'touchend', 'click']);