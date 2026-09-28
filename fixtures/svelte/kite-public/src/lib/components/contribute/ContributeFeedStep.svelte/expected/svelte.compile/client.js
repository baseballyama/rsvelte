import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconAlertTriangle,
	IconChevronDown,
	IconChevronUp,
	IconCircleCheck,
	IconCircleX,
	IconLoader2,
	IconPlus,
	IconQuestionMark,
	IconTrash,
	IconX
} from '@tabler/icons-svelte';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<p class="mt-1 text-xs text-red-600 dark:text-red-400"> </p>`);
var root_1 = $.from_html(`<div class="truncate"> </div>`);
var root_2 = $.from_html(`<div class="mt-1.5 ml-5 space-y-0.5 text-[11px] font-mono text-amber-500 dark:text-amber-500"></div>`);
var root_3 = $.from_html(`<div class="text-xs text-amber-600 dark:text-amber-400"><button class="flex items-center gap-1.5 hover:underline"><!> <span> </span> <!></button> <!></div>`);
var root_4 = $.from_html(`&mdash; <span class="text-green-600 dark:text-green-400"> </span>`, 1);
var root_5 = $.from_html(`&mdash; <span class="text-amber-600 dark:text-amber-400"> </span>`, 1);
var root_6 = $.from_html(`&mdash; <span class="text-red-600 dark:text-red-400"> </span>`, 1);
var root_7 = $.from_html(`&mdash; <span class="text-gray-500"> </span>`, 1);
var root_8 = $.from_html(`<button class="text-[11px] text-red-500 dark:text-red-400 hover:underline inline-flex items-center gap-1"><!> </button>`);
var root_9 = $.from_html(`<div class="w-4 h-4 rounded-full border-2 border-primary-300"></div>`);
var root_10 = $.from_html(`<span class="text-[10px] text-primary-400 hidden sm:inline truncate max-w-40"> </span>`);
var root_11 = $.from_html(`<div><span class="shrink-0"><!></span> <span> </span> <!> <button class="shrink-0 p-0.5 text-primary-400 hover:text-red-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity"><!></button></div>`);
var root_12 = $.from_html(`<div class="space-y-1" style="max-height: 18rem;"></div>`);
var root_13 = $.from_html(`<div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"><div class="flex items-start gap-2"><!> <p class="text-xs text-red-700 dark:text-red-300"> </p></div></div>`);
var root_14 = $.from_html(`<div class="mt-4"><div class="flex items-center justify-between mb-2"><div class="text-xs text-primary-600" aria-live="polite"> <!> <!> <!> <!></div> <!></div> <div style="max-height: 18rem;"><!></div> <!></div>`);

var root_15 = $.from_html(`<div class="bg-modal-bg rounded-lg border border-primary-200 p-5"><h2 class="text-base font-semibold text-primary mb-4"> </h2> <div class="space-y-3"><div><textarea rows="3"></textarea> <!></div> <button class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors
				bg-blue-600 hover:bg-blue-700 disabled:bg-primary-200 disabled:dark:bg-primary-700 text-white disabled:text-primary-500 disabled:dark:text-primary-400 disabled:cursor-not-allowed"><!> </button> <!></div> <!></div>`);

export default function ContributeFeedStep($$anchor, $$props) {
	$.push($$props, true);

	let feedUrlsInput = $.state('');
	let showDuplicates = $.state(false);

	// Auto-expand duplicates section when new duplicates are added
	let prevDuplicateCount = 0;

	$.user_effect(() => {
		if ($$props.duplicateFeeds.length > prevDuplicateCount) {
			$.set(showDuplicates, true);
		}

		prevDuplicateCount = $$props.duplicateFeeds.length;
	});

	function handleKeydown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAdd();
		}
	}

	function handleAdd() {
		if (!$.get(feedUrlsInput).trim()) return;

		if ($$props.onAddFeeds($.get(feedUrlsInput))) {
			$.set(feedUrlsInput, '');
		}
	}

	var div = root_15();
	var h2 = $.child(div);
	var text = $.only_child(h2, true);
	var div_1 = $.sibling(h2, 2);
	var div_2 = $.child(div_1);
	var textarea = $.child(div_2);

	$.remove_textarea_child(textarea);

	var node = $.sibling(textarea, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $$props.parseError));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.parseError) $$render(consequent);
		});
	}

	$.reset(div_2);

	var button = $.sibling(div_2, 2);
	var node_1 = $.child(button);

	IconPlus(node_1, { size: 16 });

	var text_2 = $.sibling(node_1);

	$.reset(button);

	var node_2 = $.sibling(button, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_3 = root_3();
			var button_1 = $.child(div_3);
			var node_3 = $.child(button_1);

			IconAlertTriangle(node_3, { size: 14, class: 'shrink-0' });

			var span = $.sibling(node_3, 2);
			var text_3 = $.only_child(span, true);
			var node_4 = $.sibling(span, 2);

			{
				var consequent_1 = ($$anchor) => {
					IconChevronUp($$anchor, { size: 12 });
				};

				var alternate = ($$anchor) => {
					IconChevronDown($$anchor, { size: 12 });
				};

				$.if(node_4, ($$render) => {
					if ($.get(showDuplicates)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(button_1);

			var node_5 = $.sibling(button_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_4 = root_2();

					$.each(div_4, 21, () => $$props.duplicateFeeds, $.index, ($$anchor, url) => {
						var div_5 = root_1();
						var text_4 = $.only_child(div_5, true);

						$.template_effect(() => {
							$.set_attribute(div_5, 'title', $.get(url));
							$.set_text(text_4, $.get(url));
						});

						$.append($$anchor, div_5);
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_5, ($$render) => {
					if ($.get(showDuplicates)) $$render(consequent_2);
				});
			}

			$.reset(div_3);

			$.template_effect(
				($0) => {
					$.set_attribute(button_1, 'aria-expanded', $.get(showDuplicates));
					$.set_text(text_3, $0);
				},
				[
					() => s('contribute.duplicatesSkipped', { count: String($$props.duplicateFeeds.length) })
				]
			);

			$.delegated('click', button_1, () => $.set(showDuplicates, !$.get(showDuplicates)));
			$.append($$anchor, div_3);
		};

		$.if(node_2, ($$render) => {
			if ($$props.duplicateFeeds.length > 0) $$render(consequent_3);
		});
	}

	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	{
		var consequent_15 = ($$anchor) => {
			var div_6 = root_14();
			var div_7 = $.child(div_6);
			var div_8 = $.child(div_7);
			var text_5 = $.child(div_8);
			var node_7 = $.sibling(text_5);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_2 = root_4();
					var span_1 = $.sibling($.first_child(fragment_2));
					var text_6 = $.only_child(span_1, true);

					$.template_effect(($0) => $.set_text(text_6, $0), [
						() => s('contribute.validCount', { count: String($$props.validFeeds.length) })
					]);

					$.append($$anchor, fragment_2);
				};

				$.if(node_7, ($$render) => {
					if ($$props.validFeeds.length > 0) $$render(consequent_4);
				});
			}

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_3 = root_5();
					var span_2 = $.sibling($.first_child(fragment_3));
					var text_7 = $.only_child(span_2, true);

					$.template_effect(($0) => $.set_text(text_7, $0), [
						() => s('contribute.unverifiedCount', { count: String($$props.unknownFeeds.length) })
					]);

					$.append($$anchor, fragment_3);
				};

				$.if(node_8, ($$render) => {
					if ($$props.unknownFeeds.length > 0) $$render(consequent_5);
				});
			}

			var node_9 = $.sibling(node_8, 2);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_4 = root_6();
					var span_3 = $.sibling($.first_child(fragment_4));
					var text_8 = $.only_child(span_3, true);

					$.template_effect(($0) => $.set_text(text_8, $0), [
						() => s('contribute.errorCount', { count: String($$props.errorFeeds.length) })
					]);

					$.append($$anchor, fragment_4);
				};

				$.if(node_9, ($$render) => {
					if ($$props.errorFeeds.length > 0) $$render(consequent_6);
				});
			}

			var node_10 = $.sibling(node_9, 2);

			{
				var consequent_7 = ($$anchor) => {
					var fragment_5 = root_7();
					var span_4 = $.sibling($.first_child(fragment_5));
					var text_9 = $.only_child(span_4, true);

					$.template_effect(($0) => $.set_text(text_9, $0), [
						() => s('contribute.checkingCount', { count: String($$props.pendingFeeds.length) })
					]);

					$.append($$anchor, fragment_5);
				};

				$.if(node_10, ($$render) => {
					if ($$props.pendingFeeds.length > 0) $$render(consequent_7);
				});
			}

			$.reset(div_8);

			var node_11 = $.sibling(div_8, 2);

			{
				var consequent_8 = ($$anchor) => {
					var button_2 = root_8();
					var node_12 = $.child(button_2);

					IconTrash(node_12, { size: 12 });

					var text_10 = $.sibling(node_12);

					$.reset(button_2);

					$.template_effect(($0) => $.set_text(text_10, ` ${$0 ?? ''}`), [
						() => s('contribute.removeErrored', { count: String($$props.errorFeeds.length) })
					]);

					$.delegated('click', button_2, function (...$$args) {
						$$props.onRemoveAllErrored?.apply(this, $$args);
					});

					$.append($$anchor, button_2);
				};

				$.if(node_11, ($$render) => {
					if ($$props.errorFeeds.length > 0) $$render(consequent_8);
				});
			}

			$.reset(div_7);

			var div_9 = $.sibling(div_7, 2);
			var node_13 = $.child(div_9);

			OverlayScrollbarsComponent(node_13, {
				options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } },
				children: ($$anchor, $$slotProps) => {
					var div_10 = root_12();

					$.each(div_10, 21, () => $$props.addedFeeds, (feed) => feed.url, ($$anchor, feed) => {
						var div_11 = root_11();
						var span_5 = $.child(div_11);
						var node_14 = $.child(span_5);

						{
							var consequent_9 = ($$anchor) => {
								IconLoader2($$anchor, { size: 16, class: 'animate-spin text-gray-400' });
							};

							var consequent_10 = ($$anchor) => {
								IconCircleCheck($$anchor, { size: 16, class: 'text-green-500' });
							};

							var consequent_11 = ($$anchor) => {
								IconCircleX($$anchor, { size: 16, class: 'text-red-500' });
							};

							var consequent_12 = ($$anchor) => {
								IconQuestionMark($$anchor, { size: 16, class: 'text-amber-500' });
							};

							var alternate_1 = ($$anchor) => {
								var div_12 = root_9();

								$.append($$anchor, div_12);
							};

							$.if(node_14, ($$render) => {
								if ($.get(feed).status === 'checking') $$render(consequent_9); else if ($.get(feed).status === 'valid') $$render(consequent_10, 1); else if ($.get(feed).status === 'error') $$render(consequent_11, 2); else if ($.get(feed).status === 'unknown') $$render(consequent_12, 3); else $$render(alternate_1, -1);
							});
						}

						$.reset(span_5);

						var span_6 = $.sibling(span_5, 2);
						var text_11 = $.only_child(span_6, true);
						var node_15 = $.sibling(span_6, 2);

						{
							var consequent_13 = ($$anchor) => {
								var span_7 = root_10();
								var text_12 = $.only_child(span_7, true);

								$.template_effect(() => {
									$.set_attribute(span_7, 'title', $.get(feed).error);
									$.set_text(text_12, $.get(feed).error);
								});

								$.append($$anchor, span_7);
							};

							$.if(node_15, ($$render) => {
								if ($.get(feed).error && $.get(feed).status !== 'valid') $$render(consequent_13);
							});
						}

						var button_3 = $.sibling(node_15, 2);
						var node_16 = $.child(button_3);

						IconX(node_16, { size: 14 });
						$.reset(button_3);
						$.reset(div_11);

						$.template_effect(
							($0) => {
								$.set_class(div_11, 1, `flex items-center gap-2 py-1.5 px-2 rounded-md group
								${$.get(feed).status === 'error' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-primary-50'}`);

								$.set_attribute(span_5, 'aria-label', $.get(feed).error || $.get(feed).status);
								$.set_attribute(span_5, 'title', $.get(feed).error || $.get(feed).status);

								$.set_class(span_6, 1, `flex-1 text-xs font-mono truncate
									${$.get(feed).status === 'error'
									? 'text-red-600 dark:text-red-400 line-through'
									: 'text-primary-700'}`);

								$.set_attribute(span_6, 'title', $.get(feed).url);
								$.set_text(text_11, $.get(feed).url);
								$.set_attribute(button_3, 'aria-label', $0);
							},
							[() => s('contribute.removeFeed')]
						);

						$.delegated('click', button_3, () => $$props.onRemoveFeed($.get(feed).url));
						$.append($$anchor, div_11);
					});

					$.reset(div_10);
					$.append($$anchor, div_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);

			var node_17 = $.sibling(div_9, 2);

			{
				var consequent_14 = ($$anchor) => {
					var div_13 = root_13();
					var div_14 = $.child(div_13);
					var node_18 = $.child(div_14);

					IconCircleX(node_18, { size: 16, class: 'shrink-0 mt-0.5 text-red-500' });

					var p_1 = $.sibling(node_18, 2);
					var text_13 = $.only_child(p_1, true);

					$.reset(div_14);
					$.reset(div_13);
					$.template_effect(($0) => $.set_text(text_13, $0), [() => s('contribute.allFeedsFailed')]);
					$.append($$anchor, div_13);
				};

				$.if(node_17, ($$render) => {
					if ($$props.allErrored) $$render(consequent_14);
				});
			}

			$.reset(div_6);

			$.template_effect(($0) => $.set_text(text_5, `${$0 ?? ''} `), [
				() => s('contribute.feedsAdded', { count: String($$props.addedFeeds.length) })
			]);

			$.append($$anchor, div_6);
		};

		$.if(node_6, ($$render) => {
			if ($$props.addedFeeds.length > 0) $$render(consequent_15);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4) => {
			$.set_text(text, $0);
			$.set_attribute(textarea, 'placeholder', $1);
			$.set_attribute(textarea, 'aria-label', $2);

			$.set_class(textarea, 1, `w-full px-3 py-2 border rounded-lg bg-input-bg text-primary placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-focus-ring text-sm font-mono resize-y
					${$$props.parseError
				? 'border-red-300 dark:border-red-600'
				: 'border-primary-300'}`);

			button.disabled = $3;
			$.set_text(text_2, ` ${$4 ?? ''}`);
		},
		[
			() => s('contribute.step2'),
			() => s('contribute.feedInputPlaceholder'),
			() => s('contribute.step2'),
			() => !$.get(feedUrlsInput).trim(),
			() => s('contribute.addFeeds')
		]
	);

	$.delegated('keydown', textarea, handleKeydown);
	$.bind_value(textarea, () => $.get(feedUrlsInput), ($$value) => $.set(feedUrlsInput, $$value));
	$.delegated('click', button, handleAdd);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'click']);