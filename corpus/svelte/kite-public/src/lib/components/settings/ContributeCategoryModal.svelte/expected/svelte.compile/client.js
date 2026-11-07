import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconAlertTriangle,
	IconBrandGithub,
	IconCheck,
	IconExternalLink,
	IconRss,
	IconX
} from '@tabler/icons-svelte';

import { fade, scale } from 'svelte/transition';
import Portal from 'svelte-portal';
import { s } from '$lib/client/localization.svelte';
import { createModalBehavior } from '$lib/utils/modalBehavior.svelte';
import { scrollLock } from '$lib/utils/scrollLock.js';

var root = $.from_html(`<div class="fixed inset-0 z-modal flex items-center justify-center bg-black/60 dark:bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="contribute-title" tabindex="-1"><div class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden" role="document"><div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 id="contribute-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100"> </h2> <button class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible-ring"><!></button></div> <div class="p-5 space-y-5"><p class="text-sm text-gray-600 dark:text-gray-400"> </p> <div class="space-y-3"><h3 class="text-sm font-medium text-gray-900 dark:text-gray-100"> </h3> <ul class="space-y-2.5"><li class="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400"><!> <span><strong class="text-gray-900 dark:text-gray-200"> </strong> </span></li> <li class="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400"><!> <span><strong class="text-gray-900 dark:text-gray-200"> </strong> </span></li> <li class="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400"><!> <span><strong class="text-gray-900 dark:text-gray-200"> </strong> </span></li></ul></div> <div class="space-y-3 pt-2"><a href="/contribute" class="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus-visible-ring"><!> </a> <p class="text-xs text-center text-gray-500 dark:text-gray-500"> </p></div> <div class="relative"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200 dark:border-gray-700"></div></div> <div class="relative flex justify-center text-xs"><span class="px-2 bg-white dark:bg-gray-800 text-gray-500"> </span></div></div> <div class="text-center space-y-2"><a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus-visible-ring rounded"><!> <!></a> <span class="mx-2 text-gray-300 dark:text-gray-600">|</span> <a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus-visible-ring rounded"> <!></a></div></div></div></div>`);

export default function ContributeCategoryModal($$anchor, $$props) {
	$.push($$props, true);

	const modal = createModalBehavior();
	let dialogElement = $.state(undefined);
	let closeButtonRef = $.state(undefined);
	let previousActiveElement = null;

	// Handle keyboard events
	function handleKeydown(e) {
		if (e.key === 'Escape') {
			$$props.onClose();

			return;
		}

		// Focus trap
		if (e.key === 'Tab' && $.get(dialogElement)) {
			const focusableElements = Array.from($.get(dialogElement).querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex="0"]'));

			if (focusableElements.length === 0) return;

			const first = focusableElements[0];
			const last = focusableElements[focusableElements.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	// Manage focus and scroll lock
	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		if ($$props.visible) {
			previousActiveElement = document.activeElement;
			scrollLock.lock();

			requestAnimationFrame(() => {
				$.get(closeButtonRef)?.focus();
			});

			return () => {
				scrollLock.unlock();

				if (previousActiveElement && 'focus' in previousActiveElement) {
					previousActiveElement.focus();
				}
			};
		}
	});

	// Pre-filled issue URL for category suggestions (fallback)
	const ISSUE_URL = 'https://github.com/kagisearch/kite-public/issues/new?labels=category&title=New+Category+Suggestion:+[Category+Name]&body=' + encodeURIComponent(`## Category Name
<!-- Replace with your category name, e.g., "Aviation", "South Korea", "Climate" -->


## Description
<!-- Brief description of what this category covers -->


## RSS Feeds
<!--
Guidelines:
- 25+ feeds required, but more is always better
- No need for "balance" \u2014 a left-wing source doesn\u2019t need a right-wing counterpart
  State media, partisan outlets, all fine. Our system corroborates facts across sources.
- No conspiracy content \u2014 no fabricated claims, event denial, or hoax content
-->

1.
2.
3.
<!-- Add more feeds... -->

`);

	const FEEDS_FILE_URL = 'https://github.com/kagisearch/kite-public/blob/main/kite_feeds.json';
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var div_2 = $.child(div_1);
					var h2 = $.child(div_2);
					var text = $.only_child(h2, true);
					var button = $.sibling(h2, 2);
					var node_1 = $.child(button);

					IconX(node_1, { size: 20 });
					$.reset(button);
					$.bind_this(button, ($$value) => $.set(closeButtonRef, $$value), () => $.get(closeButtonRef));
					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var p = $.child(div_3);
					var text_1 = $.only_child(p, true);
					var div_4 = $.sibling(p, 2);
					var h3 = $.child(div_4);
					var text_2 = $.only_child(h3, true);
					var ul = $.sibling(h3, 2);
					var li = $.child(ul);
					var node_2 = $.child(li);

					IconRss(node_2, { size: 18, class: 'shrink-0 mt-0.5 text-blue-500' });

					var span = $.sibling(node_2, 2);
					var strong = $.child(span);
					var text_3 = $.only_child(strong, true);
					var text_4 = $.sibling(strong);

					$.reset(span);
					$.reset(li);

					var li_1 = $.sibling(li, 2);
					var node_3 = $.child(li_1);

					IconCheck(node_3, { size: 18, class: 'shrink-0 mt-0.5 text-green-500' });

					var span_1 = $.sibling(node_3, 2);
					var strong_1 = $.child(span_1);
					var text_5 = $.only_child(strong_1, true);
					var text_6 = $.sibling(strong_1);

					$.reset(span_1);
					$.reset(li_1);

					var li_2 = $.sibling(li_1, 2);
					var node_4 = $.child(li_2);

					IconAlertTriangle(node_4, { size: 18, class: 'shrink-0 mt-0.5 text-amber-500' });

					var span_2 = $.sibling(node_4, 2);
					var strong_2 = $.child(span_2);
					var text_7 = $.only_child(strong_2, true);
					var text_8 = $.sibling(strong_2);

					$.reset(span_2);
					$.reset(li_2);
					$.reset(ul);
					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var a = $.child(div_5);
					var node_5 = $.child(a);

					IconRss(node_5, { size: 18 });

					var text_9 = $.sibling(node_5);

					$.reset(a);

					var p_1 = $.sibling(a, 2);
					var text_10 = $.only_child(p_1, true);

					$.reset(div_5);

					var div_6 = $.sibling(div_5, 2);
					var div_7 = $.sibling($.child(div_6), 2);
					var span_3 = $.child(div_7);
					var text_11 = $.only_child(span_3, true);

					$.reset(div_7);
					$.reset(div_6);

					var div_8 = $.sibling(div_6, 2);
					var a_1 = $.child(div_8);
					var node_6 = $.child(a_1);

					IconBrandGithub(node_6, { size: 14 });

					var text_12 = $.sibling(node_6);
					var node_7 = $.sibling(text_12);

					IconExternalLink(node_7, { size: 14 });
					$.reset(a_1);

					var a_2 = $.sibling(a_1, 4);

					$.set_attribute(a_2, 'href', FEEDS_FILE_URL);

					var text_13 = $.child(a_2);
					var node_8 = $.sibling(text_13);

					IconExternalLink(node_8, { size: 14 });
					$.reset(a_2);
					$.reset(div_8);
					$.reset(div_3);
					$.reset(div_1);
					$.bind_this(div_1, ($$value) => $.set(dialogElement, $$value), () => $.get(dialogElement));
					$.reset(div);

					$.template_effect(
						(
							$0,
							$1,
							$2,
							$3,
							$4,
							$5,
							$6,
							$7,
							$8,
							$9,
							$10,
							$11,
							$12,
							$13,
							$14
						) => {
							$.set_text(text, $0);
							$.set_attribute(button, 'aria-label', $1);
							$.set_text(text_1, $2);
							$.set_text(text_2, $3);
							$.set_text(text_3, $4);
							$.set_text(text_4, `  ${$5 ?? ''}`);
							$.set_text(text_5, $6);
							$.set_text(text_6, `  ${$7 ?? ''}`);
							$.set_text(text_7, $8);
							$.set_text(text_8, `  ${$9 ?? ''}`);
							$.set_text(text_9, ` ${$10 ?? ''}`);
							$.set_text(text_10, $11);
							$.set_text(text_11, $12);
							$.set_attribute(a_1, 'href', ISSUE_URL);
							$.set_text(text_12, ` ${$13 ?? ''} `);
							$.set_text(text_13, `${$14 ?? ''} `);
						},
						[
							() => s("settings.categories.contribute.title") || "Contribute a Category",
							() => s("ui.close") || "Close",
							() => s("settings.categories.contribute.intro") || "Help expand Kagi News coverage by suggesting new categories. Community contributions are what make Kagi News diverse and comprehensive.",
							() => s("settings.categories.contribute.requirements") || "Guidelines:",
							() => s("settings.categories.contribute.req1Title") || "25+ RSS feeds (more is better)",
							() => s("settings.categories.contribute.req1Desc") || "\u2014 the more high-quality feeds, the better the coverage",
							() => s("settings.categories.contribute.req2Title") || "No need for \"balance\"",
							() => s("settings.categories.contribute.req2Desc") || "\u2014 a left-wing source doesn\u2019t need a right-wing counterpart. State media, partisan outlets, all fine. Our system corroborates facts across multiple sources, so outliers can\u2019t skew the output. This is also why more sources = better",
							() => s("settings.categories.contribute.req3Title") || "No conspiracy content",
							() => s("settings.categories.contribute.req3Desc") || "\u2014 no fabricated claims, event denial, or hoax content",
							() => s("settings.categories.contribute.suggestButton") || "Suggest a Category",
							() => s("settings.categories.contribute.suggestHint") || "Add feeds interactively with validation and automatic PR creation",
							() => s("settings.categories.contribute.or") || "or",
							() => s("settings.categories.contribute.openIssue") || "Open a GitHub issue",
							() => s("settings.categories.contribute.prLink") || "Submit a PR directly"
						]
					);

					$.delegated('click', div, (e) => modal.handleBackdropClick(e, $$props.onClose));
					$.delegated('keydown', div, handleKeydown);

					$.delegated('click', button, function (...$$args) {
						$$props.onClose?.apply(this, $$args);
					});

					$.transition(3, div_1, () => scale, () => ({
						duration: modal.getTransitionDuration(),
						start: 0.95,
						opacity: 0
					}));

					$.transition(3, div, () => fade, () => ({ duration: modal.getTransitionDuration() }));
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($$props.visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);