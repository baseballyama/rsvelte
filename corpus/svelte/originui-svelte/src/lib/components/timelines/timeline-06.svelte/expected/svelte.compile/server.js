import * as $ from 'svelte/internal/server';
import GitCompare from '@lucide/svelte/icons/git-compare';
import GitFork from '@lucide/svelte/icons/git-fork';
import GitMerge from '@lucide/svelte/icons/git-merge';
import GitPullRequest from '@lucide/svelte/icons/git-pull-request';

import {
	Timeline,
	TimelineContent,
	TimelineDate,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle
} from '$lib/components/ui/timeline';

export default function Timeline_06($$renderer) {
	const items = [
		{
			date: '15 minutes ago',
			description: 'Forked the repository to create a new branch for development.',
			icon: GitFork,
			id: 1,
			title: 'Forked Repository'
		},

		{
			date: '10 minutes ago',
			description: 'Submitted PR #342 with new feature implementation. Waiting for code review from team leads.',
			icon: GitPullRequest,
			id: 2,
			title: 'Pull Request Submitted'
		},

		{
			date: '5 minutes ago',
			description: 'Received comments on PR. Minor adjustments needed in error handling and documentation.',
			icon: GitCompare,
			id: 3,
			title: 'Comparing Branches'
		},

		{
			description: 'Merged the feature branch into the main branch. Ready for deployment.',
			icon: GitMerge,
			id: 4,
			title: 'Merged Branch'
		}
	];

	Timeline($$renderer, {
		defaultValue: 3,
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				TimelineItem($$renderer, {
					step: item.id,
					class: 'group-data-[orientation=vertical]/timeline:ms-10',
					children: ($$renderer) => {
						TimelineHeader($$renderer, {
							children: ($$renderer) => {
								TimelineSeparator($$renderer, {
									class: 'group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5'
								});

								$$renderer.push(`<!----> `);

								TimelineTitle($$renderer, {
									class: 'mt-0.5',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.title)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TimelineIndicator($$renderer, {
									class: 'bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7',
									children: ($$renderer) => {
										if (item.icon) {
											$$renderer.push('<!--[-->');
											item.icon($$renderer, { size: 14 });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TimelineContent($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(item.description)} `);

								TimelineDate($$renderer, {
									class: 'mt-2 mb-0',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.date)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}