import * as $ from 'svelte/internal/server';

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

export default function Timeline_04($$renderer) {
	const items = [
		{
			date: '15 minutes ago',
			description: 'Submitted PR #342 with new feature implementation. Waiting for code review from team leads.',
			id: 1,
			title: 'Pull Request Submitted'
		},

		{
			date: '10 minutes ago',
			description: 'Automated tests and build process initiated. Running unit tests and code quality checks.',
			id: 2,
			title: 'CI Pipeline Started'
		},

		{
			date: '5 minutes ago',
			description: 'Received comments on PR. Minor adjustments needed in error handling and documentation.',
			id: 3,
			title: 'Code Review Feedback'
		},

		{
			description: 'Implemented requested changes and pushed updates to feature branch. Awaiting final approval.',
			id: 4,
			title: 'Changes Pushed'
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
					children: ($$renderer) => {
						TimelineHeader($$renderer, {
							children: ($$renderer) => {
								TimelineSeparator($$renderer, {});
								$$renderer.push(`<!----> `);

								TimelineTitle($$renderer, {
									class: '-mt-0.5',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.title)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								TimelineIndicator($$renderer, {});
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