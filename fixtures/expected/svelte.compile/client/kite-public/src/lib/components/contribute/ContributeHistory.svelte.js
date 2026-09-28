import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconChevronDown,
	IconChevronUp,
	IconCircleCheck,
	IconCircleX,
	IconClock,
	IconExternalLink,
	IconGitMerge
} from '@tabler/icons-svelte';

import { s } from '$lib/client/localization.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<div class="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"><p class="text-xs text-red-700 dark:text-red-300"><span class="font-medium"> </span> </p></div>`);
var root_2 = $.from_html(`<div></div>`);
var root_3 = $.from_html(`<div class="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"><!></div>`);
var root_4 = $.from_html(`<div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><!></div>`);
var root_5 = $.from_html(`<div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"><!></div>`);
var root_6 = $.from_html(`<div class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"><!></div>`);
var root_7 = $.from_html(`<div class="w-6 h-6 rounded-full border-2 border-primary-300"></div>`);
var root_8 = $.from_html(`<!> <div class="flex flex-col items-center" style="min-width: 3rem;"><!> <span><!></span></div>`, 1);
var root_9 = $.from_html(`<div class="px-3 pb-3 pt-1 border-t border-primary-200"><div class="flex items-center gap-2 text-xs text-primary-500 mb-3"><span> </span> <span class="text-primary-300">&middot;</span> <!> <span class="text-primary-300">&middot;</span> <a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-accent-links hover:underline"> <!></a></div> <!> <div class="flex items-start"></div></div>`);
var root_10 = $.from_html(`<div class="rounded-md bg-primary-50 overflow-hidden"><button class="w-full flex items-center gap-2.5 py-2 px-2.5 text-sm text-left hover:bg-primary-100 transition-colors"><div></div> <span class="font-medium text-primary truncate min-w-0"> </span> <span> </span> <div class="flex-1"></div> <span class="shrink-0 text-xs text-primary-400"> </span> <!></button> <!></div>`);
var root_11 = $.from_html(` <!>`, 1);
var root_12 = $.from_html(`<button class="mt-2.5 text-xs text-accent-links hover:underline inline-flex items-center gap-1"><!></button>`);
var root_13 = $.from_html(`<div class="bg-modal-bg rounded-lg border border-primary-200 p-4"><h2 class="text-sm font-semibold text-primary mb-3"> </h2> <div class="space-y-1.5"></div> <!></div>`);

export default function ContributeHistory($$anchor, $$props) {
	$.push($$props, true);

	const PREVIEW_COUNT = 3;
	let showAll = $.state(false);
	let expandedId = $.state(null);

	const visibleContributions = $.derived(() => $.get(showAll)
		? $$props.contributions
		: $$props.contributions.slice(0, PREVIEW_COUNT));

	const hasMore = $.derived(() => $$props.contributions.length > PREVIEW_COUNT);
	const hiddenCount = $.derived(() => $$props.contributions.length - PREVIEW_COUNT);
	const STEPS = ['submitted', 'merged', 'live'];

	const STATUS_CONFIG = {
		submitted: { color: 'bg-blue-500', icon: IconClock },
		merged: { color: 'bg-purple-500', icon: IconGitMerge },
		live: { color: 'bg-green-500', icon: IconCircleCheck },
		declined: { color: 'bg-red-500', icon: IconCircleX }
	};

	function getStepState(step, status) {
		if (status === 'declined') {
			return step === 'submitted' ? 'declined' : 'pending';
		}

		const statusIndex = STEPS.indexOf(status);
		const stepIndex = STEPS.indexOf(step);

		if (stepIndex < statusIndex) return 'completed';
		if (stepIndex === statusIndex) return 'current';

		return 'pending';
	}

	function toggleExpanded(id) {
		$.set(expandedId, $.get(expandedId) === id ? null : id, true);
	}

	function formatRelativeDate(date) {
		const now = Date.now();
		const diff = now - new Date(date).getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days === 1) return s('time.relative.oneDay') || '1 day ago';
		if (days > 0) return s('time.relative.days', { count: String(days) }) || `${days} days ago`;
		if (hours === 1) return s('time.relative.oneHour') || '1 hour ago';
		if (hours > 0) return s('time.relative.hours', { count: String(hours) }) || `${hours} hours ago`;
		if (minutes === 1) return s('time.relative.oneMinute') || '1 minute ago';
		if (minutes > 0) return s('time.relative.minutes', { count: String(minutes) }) || `${minutes} minutes ago`;

		return s('time.relative.justNow') || 'just now';
	}

	var div = root_13();
	var h2 = $.child(div);
	var text = $.only_child(h2, true);
	var div_1 = $.sibling(h2, 2);

	$.each(div_1, 21, () => $.get(visibleContributions), (contribution) => contribution.id, ($$anchor, contribution) => {
		const config = $.derived(() => STATUS_CONFIG[$.get(contribution).pipelineStatus]);
		const isExpanded = $.derived(() => $.get(expandedId) === $.get(contribution).id);
		var div_2 = root_10();
		var button = $.child(div_2);
		var div_3 = $.child(button);
		var span = $.sibling(div_3, 2);
		var text_1 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_2 = $.only_child(span_1, true);
		var span_2 = $.sibling(span_1, 4);
		var text_3 = $.only_child(span_2, true);
		var node = $.sibling(span_2, 2);

		{
			var consequent = ($$anchor) => {
				IconChevronUp($$anchor, { size: 14, class: 'shrink-0 text-primary-400' });
			};

			var alternate = ($$anchor) => {
				IconChevronDown($$anchor, { size: 14, class: 'shrink-0 text-primary-400' });
			};

			$.if(node, ($$render) => {
				if ($.get(isExpanded)) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(button);

		var node_1 = $.sibling(button, 2);

		{
			var consequent_10 = ($$anchor) => {
				var div_4 = root_9();
				var div_5 = $.child(div_4);
				var span_3 = $.child(div_5);
				var text_4 = $.only_child(span_3, true);
				var node_2 = $.sibling(span_3, 4);

				{
					var consequent_1 = ($$anchor) => {
						var span_4 = root();
						var text_5 = $.only_child(span_4, true);

						$.template_effect(($0) => $.set_text(text_5, $0), [() => s('contribute.history.typeNew')]);
						$.append($$anchor, span_4);
					};

					var alternate_1 = ($$anchor) => {
						var span_5 = root();
						var text_6 = $.only_child(span_5, true);

						$.template_effect(($0) => $.set_text(text_6, $0), [() => s('contribute.history.typeExisting')]);
						$.append($$anchor, span_5);
					};

					$.if(node_2, ($$render) => {
						if ($.get(contribution).isNew) $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				var a = $.sibling(node_2, 4);
				var text_7 = $.child(a);
				var node_3 = $.sibling(text_7);

				IconExternalLink(node_3, { size: 11 });
				$.reset(a);
				$.reset(div_5);

				var node_4 = $.sibling(div_5, 2);

				{
					var consequent_2 = ($$anchor) => {
						var div_6 = root_1();
						var p = $.child(div_6);
						var span_6 = $.child(p);
						var text_8 = $.only_child(span_6);
						var text_9 = $.sibling(span_6);

						$.reset(p);
						$.reset(div_6);

						$.template_effect(
							($0) => {
								$.set_text(text_8, `${$0 ?? ''}:`);
								$.set_text(text_9, ` ${$.get(contribution).declineReason ?? ''}`);
							},
							[() => s('contribute.history.declineReason')]
						);

						$.append($$anchor, div_6);
					};

					$.if(node_4, ($$render) => {
						if ($.get(contribution).pipelineStatus === 'declined' && $.get(contribution).declineReason) $$render(consequent_2);
					});
				}

				var div_7 = $.sibling(node_4, 2);

				$.each(div_7, 21, () => STEPS, $.index, ($$anchor, step, i) => {
					const state = $.derived(() => $.get(contribution).pipelineStatus === 'declined'
						? $.get(step) === 'submitted' ? 'declined' : 'pending'
						: getStepState($.get(step), $.get(contribution).pipelineStatus));

					var fragment_2 = root_8();
					var node_5 = $.first_child(fragment_2);

					{
						var consequent_3 = ($$anchor) => {
							var div_8 = root_2();

							$.template_effect(() => $.set_class(div_8, 1, `flex-1 h-0.5 mt-3 ${$.get(state) === 'pending'
								? 'bg-primary-200'
								: $.get(contribution).pipelineStatus === 'declined' ? 'bg-primary-200' : 'bg-green-400 dark:bg-green-600'}`));

							$.append($$anchor, div_8);
						};

						$.if(node_5, ($$render) => {
							if (i > 0) $$render(consequent_3);
						});
					}

					var div_9 = $.sibling(node_5, 2);
					var node_6 = $.child(div_9);

					{
						let $0 = $.derived(() => s(`contribute.history.status.${$.get(contribution).pipelineStatus === 'declined' && $.get(step) === 'submitted' ? 'declined' : $.get(step)}.tooltip`) || '');

						Tooltip(node_6, {
							get text() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_7 = $.first_child(fragment_3);

								{
									var consequent_4 = ($$anchor) => {
										var div_10 = root_3();
										var node_8 = $.child(div_10);

										IconCircleX(node_8, { size: 13, class: 'text-white' });
										$.reset(div_10);
										$.append($$anchor, div_10);
									};

									var consequent_5 = ($$anchor) => {
										var div_11 = root_4();
										var node_9 = $.child(div_11);

										IconCircleCheck(node_9, { size: 13, class: 'text-white' });
										$.reset(div_11);
										$.append($$anchor, div_11);
									};

									var consequent_6 = ($$anchor) => {
										var div_12 = root_5();
										var node_10 = $.child(div_12);

										IconClock(node_10, { size: 13, class: 'text-white' });
										$.reset(div_12);
										$.append($$anchor, div_12);
									};

									var consequent_7 = ($$anchor) => {
										var div_13 = root_6();
										var node_11 = $.child(div_13);

										IconGitMerge(node_11, { size: 13, class: 'text-white' });
										$.reset(div_13);
										$.append($$anchor, div_13);
									};

									var consequent_8 = ($$anchor) => {
										var div_14 = root_4();
										var node_12 = $.child(div_14);

										IconCircleCheck(node_12, { size: 13, class: 'text-white' });
										$.reset(div_14);
										$.append($$anchor, div_14);
									};

									var alternate_2 = ($$anchor) => {
										var div_15 = root_7();

										$.append($$anchor, div_15);
									};

									$.if(node_7, ($$render) => {
										if ($.get(state) === 'declined') $$render(consequent_4); else if ($.get(state) === 'completed') $$render(consequent_5, 1); else if ($.get(state) === 'current' && $.get(step) === 'submitted') $$render(consequent_6, 2); else if ($.get(state) === 'current' && $.get(step) === 'merged') $$render(consequent_7, 3); else if ($.get(state) === 'current' && $.get(step) === 'live') $$render(consequent_8, 4); else $$render(alternate_2, -1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					}

					var span_7 = $.sibling(node_6, 2);
					var node_13 = $.child(span_7);

					{
						var consequent_9 = ($$anchor) => {
							var text_10 = $.text();

							$.template_effect(($0) => $.set_text(text_10, $0), [() => s('contribute.history.status.declined')]);
							$.append($$anchor, text_10);
						};

						var alternate_3 = ($$anchor) => {
							var text_11 = $.text();

							$.template_effect(($0) => $.set_text(text_11, $0), [() => s(`contribute.history.status.${$.get(step)}`)]);
							$.append($$anchor, text_11);
						};

						$.if(node_13, ($$render) => {
							if ($.get(contribution).pipelineStatus === 'declined' && $.get(step) === 'submitted') $$render(consequent_9); else $$render(alternate_3, -1);
						});
					}

					$.reset(span_7);
					$.reset(div_9);

					$.template_effect(() => $.set_class(span_7, 1, `mt-1 text-[10px] font-medium
											${$.get(state) === 'declined'
						? 'text-red-500'
						: $.get(state) === 'pending'
							? 'text-primary-400'
							: $.get(state) === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-primary'}`));

					$.append($$anchor, fragment_2);
				});

				$.reset(div_7);
				$.reset(div_4);

				$.template_effect(
					($0, $1) => {
						$.set_text(text_4, $0);
						$.set_attribute(a, 'href', $.get(contribution).prUrl);
						$.set_text(text_7, `${$1 ?? ''} `);
					},
					[
						() => s('contribute.history.feedsAdded', { count: String($.get(contribution).feedCount) }),
						() => s('contribute.history.pr', { number: String($.get(contribution).prNumber) })
					]
				);

				$.append($$anchor, div_4);
			};

			$.if(node_1, ($$render) => {
				if ($.get(isExpanded)) $$render(consequent_10);
			});
		}

		$.reset(div_2);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(button, 'aria-expanded', $.get(isExpanded));
				$.set_class(div_3, 1, `w-2 h-2 rounded-full ${$.get(config).color ?? ''} shrink-0`);
				$.set_text(text_1, $.get(contribution).category);
				$.set_class(span_1, 1, `shrink-0 text-xs ${$.get(contribution).pipelineStatus === 'declined' ? 'text-red-500' : 'text-primary-500'}`);
				$.set_text(text_2, $0);
				$.set_text(text_3, $1);
			},
			[
				() => s(`contribute.history.status.${$.get(contribution).pipelineStatus}`),
				() => formatRelativeDate($.get(contribution).createdAt)
			]
		);

		$.delegated('click', button, () => toggleExpanded($.get(contribution).id));
		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var node_14 = $.sibling(div_1, 2);

	{
		var consequent_12 = ($$anchor) => {
			var button_1 = root_12();
			var node_15 = $.child(button_1);

			{
				var consequent_11 = ($$anchor) => {
					var fragment_6 = root_11();
					var text_12 = $.first_child(fragment_6);
					var node_16 = $.sibling(text_12);

					IconChevronUp(node_16, { size: 13 });
					$.template_effect(($0) => $.set_text(text_12, `${$0 ?? ''} `), [() => s('contribute.history.showLess')]);
					$.append($$anchor, fragment_6);
				};

				var alternate_4 = ($$anchor) => {
					var fragment_7 = root_11();
					var text_13 = $.first_child(fragment_7);
					var node_17 = $.sibling(text_13);

					IconChevronDown(node_17, { size: 13 });

					$.template_effect(($0) => $.set_text(text_13, `${$0 ?? ''} `), [
						() => s('contribute.history.viewAll', { count: String($.get(hiddenCount)) })
					]);

					$.append($$anchor, fragment_7);
				};

				$.if(node_15, ($$render) => {
					if ($.get(showAll)) $$render(consequent_11); else $$render(alternate_4, -1);
				});
			}

			$.reset(button_1);
			$.delegated('click', button_1, () => $.set(showAll, !$.get(showAll)));
			$.append($$anchor, button_1);
		};

		$.if(node_14, ($$render) => {
			if ($.get(hasMore)) $$render(consequent_12);
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => s('contribute.history.titleWithCount', { count: String($$props.contributions.length) })
	]);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);