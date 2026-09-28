import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Timeline_06($$anchor) {
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

	Timeline($$anchor, {
		defaultValue: 3,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
				TimelineItem($$anchor, {
					get step() {
						return $.get(item).id;
					},
					class: 'group-data-[orientation=vertical]/timeline:ms-10',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_2();
						var node_1 = $.first_child(fragment_3);

						TimelineHeader(node_1, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_2 = $.first_child(fragment_4);

								TimelineSeparator(node_2, {
									class: 'group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5'
								});

								var node_3 = $.sibling(node_2, 2);

								TimelineTitle(node_3, {
									class: 'mt-0.5',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(item).title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								TimelineIndicator(node_4, {
									class: 'bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_5 = $.first_child(fragment_6);

										$.component(node_5, () => $.get(item).icon, ($$anchor, item_icon) => {
											item_icon($$anchor, { size: 14 });
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_1, 2);

						TimelineContent(node_6, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_7 = root_1();
								var text_1 = $.first_child(fragment_7);
								var node_7 = $.sibling(text_1);

								TimelineDate(node_7, {
									class: 'mt-2 mb-0',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(item).date));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								$.template_effect(() => $.set_text(text_1, `${$.get(item).description ?? ''} `));
								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}