import * as $ from 'svelte/internal/server';

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

export default function ContributeHistory($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { contributions } = $$props;
		const PREVIEW_COUNT = 3;
		let showAll = false;
		let expandedId = null;
		const visibleContributions = $.derived(() => showAll ? contributions : contributions.slice(0, PREVIEW_COUNT));
		const hasMore = $.derived(() => contributions.length > PREVIEW_COUNT);
		const hiddenCount = $.derived(() => contributions.length - PREVIEW_COUNT);
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
			expandedId = expandedId === id ? null : id;
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

		$$renderer.push(`<div class="bg-modal-bg rounded-lg border border-primary-200 p-4"><h2 class="text-sm font-semibold text-primary mb-3">${$.escape(s('contribute.history.titleWithCount', { count: String(contributions.length) }))}</h2> <div class="space-y-1.5"><!--[-->`);

		const each_array = $.ensure_array_like(visibleContributions());

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let contribution = each_array[$$index_1];
			const config = STATUS_CONFIG[contribution.pipelineStatus];
			const isExpanded = expandedId === contribution.id;

			$$renderer.push(`<div class="rounded-md bg-primary-50 overflow-hidden"><button${$.attr('aria-expanded', isExpanded)} class="w-full flex items-center gap-2.5 py-2 px-2.5 text-sm text-left hover:bg-primary-100 transition-colors"><div${$.attr_class(`w-2 h-2 rounded-full ${$.stringify(config.color)} shrink-0`)}></div> <span class="font-medium text-primary truncate min-w-0">${$.escape(contribution.category)}</span> <span${$.attr_class(`shrink-0 text-xs ${contribution.pipelineStatus === 'declined' ? 'text-red-500' : 'text-primary-500'}`)}>${$.escape(s(`contribute.history.status.${contribution.pipelineStatus}`))}</span> <div class="flex-1"></div> <span class="shrink-0 text-xs text-primary-400">${$.escape(formatRelativeDate(contribution.createdAt))}</span> `);

			if (isExpanded) {
				$$renderer.push('<!--[0-->');
				IconChevronUp($$renderer, { size: 14, class: 'shrink-0 text-primary-400' });
			} else {
				$$renderer.push('<!--[-1-->');
				IconChevronDown($$renderer, { size: 14, class: 'shrink-0 text-primary-400' });
			}

			$$renderer.push(`<!--]--></button> `);

			if (isExpanded) {
				$$renderer.push(`<!--[0--><div class="px-3 pb-3 pt-1 border-t border-primary-200"><div class="flex items-center gap-2 text-xs text-primary-500 mb-3"><span>${$.escape(s('contribute.history.feedsAdded', { count: String(contribution.feedCount) }))}</span> <span class="text-primary-300">·</span> `);

				if (contribution.isNew) {
					$$renderer.push(`<!--[0--><span>${$.escape(s('contribute.history.typeNew'))}</span>`);
				} else {
					$$renderer.push(`<!--[-1--><span>${$.escape(s('contribute.history.typeExisting'))}</span>`);
				}

				$$renderer.push(`<!--]--> <span class="text-primary-300">·</span> <a${$.attr('href', contribution.prUrl)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-accent-links hover:underline">${$.escape(s('contribute.history.pr', { number: String(contribution.prNumber) }))} `);
				IconExternalLink($$renderer, { size: 11 });
				$$renderer.push(`<!----></a></div> `);

				if (contribution.pipelineStatus === 'declined' && contribution.declineReason) {
					$$renderer.push(`<!--[0--><div class="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"><p class="text-xs text-red-700 dark:text-red-300"><span class="font-medium">${$.escape(s('contribute.history.declineReason'))}:</span> ${$.escape(contribution.declineReason)}</p></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex items-start"><!--[-->`);

				const each_array_1 = $.ensure_array_like(STEPS);

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let step = each_array_1[i];

					const state = contribution.pipelineStatus === 'declined'
						? step === 'submitted' ? 'declined' : 'pending'
						: getStepState(step, contribution.pipelineStatus);

					if (i > 0) {
						$$renderer.push(`<!--[0--><div${$.attr_class(`flex-1 h-0.5 mt-3 ${state === 'pending'
							? 'bg-primary-200'
							: contribution.pipelineStatus === 'declined' ? 'bg-primary-200' : 'bg-green-400 dark:bg-green-600'}`)}></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="flex flex-col items-center" style="min-width: 3rem;">`);

					Tooltip($$renderer, {
						text: s(`contribute.history.status.${contribution.pipelineStatus === 'declined' && step === 'submitted' ? 'declined' : step}.tooltip`) || '',
						children: ($$renderer) => {
							if (state === 'declined') {
								$$renderer.push(`<!--[0--><div class="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">`);
								IconCircleX($$renderer, { size: 13, class: 'text-white' });
								$$renderer.push(`<!----></div>`);
							} else if (state === 'completed') {
								$$renderer.push(`<!--[1--><div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">`);
								IconCircleCheck($$renderer, { size: 13, class: 'text-white' });
								$$renderer.push(`<!----></div>`);
							} else if (state === 'current' && step === 'submitted') {
								$$renderer.push(`<!--[2--><div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">`);
								IconClock($$renderer, { size: 13, class: 'text-white' });
								$$renderer.push(`<!----></div>`);
							} else if (state === 'current' && step === 'merged') {
								$$renderer.push(`<!--[3--><div class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">`);
								IconGitMerge($$renderer, { size: 13, class: 'text-white' });
								$$renderer.push(`<!----></div>`);
							} else if (state === 'current' && step === 'live') {
								$$renderer.push(`<!--[4--><div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">`);
								IconCircleCheck($$renderer, { size: 13, class: 'text-white' });
								$$renderer.push(`<!----></div>`);
							} else {
								$$renderer.push(`<!--[-1--><div class="w-6 h-6 rounded-full border-2 border-primary-300"></div>`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span${$.attr_class(`mt-1 text-[10px] font-medium ${state === 'declined'
						? 'text-red-500'
						: state === 'pending'
							? 'text-primary-400'
							: state === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-primary'}`)}>`);

					if (contribution.pipelineStatus === 'declined' && step === 'submitted') {
						$$renderer.push(`<!--[0-->${$.escape(s('contribute.history.status.declined'))}`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(s(`contribute.history.status.${step}`))}`);
					}

					$$renderer.push(`<!--]--></span></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (hasMore()) {
			$$renderer.push(`<!--[0--><button class="mt-2.5 text-xs text-accent-links hover:underline inline-flex items-center gap-1">`);

			if (showAll) {
				$$renderer.push(`<!--[0-->${$.escape(s('contribute.history.showLess'))} `);
				IconChevronUp($$renderer, { size: 13 });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(s('contribute.history.viewAll', { count: String(hiddenCount()) }))} `);
				IconChevronDown($$renderer, { size: 13 });
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}