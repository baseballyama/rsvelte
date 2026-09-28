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

export default function Timeline_11($$renderer) {
	const items = [
		{
			date: 'Mar 15, 2024',
			description: 'Initial team meeting.',
			id: 1,
			title: 'Project Kickoff'
		},

		{
			date: 'Mar 22, 2024',
			description: 'Completed wireframes.',
			id: 2,
			title: 'Design Phase'
		},

		{
			date: 'Apr 5, 2024',
			description: 'Backend development.',
			id: 3,
			title: 'Development Sprint'
		},

		{
			date: 'Apr 19, 2024',
			description: 'Performance optimization.',
			id: 4,
			title: 'Testing & Deployment'
		}
	];

	Timeline($$renderer, {
		defaultValue: 3,
		orientation: 'horizontal',
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

								TimelineDate($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.date)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TimelineTitle($$renderer, {
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
								$$renderer.push(`<!---->${$.escape(item.description)}`);
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