import * as $ from 'svelte/internal/server';

import {
	Timeline,
	TimelineDate,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle
} from '$lib/components/ui/timeline';

export default function Timeline_08($$renderer) {
	const items = [
		{ date: 'Mar 15, 2024', id: 1, title: 'Project Kickoff' },
		{ date: 'Mar 22, 2024', id: 2, title: 'Design Phase' },
		{ date: 'Apr 5, 2024', id: 3, title: 'Development Sprint' },
		{ date: 'Apr 19, 2024', id: 4, title: 'Testing & Deployment' },
		{ date: 'May 3, 2024', id: 5, title: 'User Training' },
		{ date: 'May 17, 2024', id: 6, title: 'Project Handover' }
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
					class: [
						'w-[calc(50%-1.5rem)]',
						'odd:group-data-[orientation=vertical]/timeline:ms-auto',
						'even:group-data-[orientation=vertical]/timeline:text-right',
						'even:group-data-[orientation=vertical]/timeline:ml-0',
						'even:group-data-[orientation=vertical]/timeline:mr-8',
						'even:**:data-[slot=timeline-indicator]:group-data-[orientation=vertical]/timeline:-right-6',
						'even:**:data-[slot=timeline-indicator]:group-data-[orientation=vertical]/timeline:left-auto',
						'even:**:data-[slot=timeline-indicator]:group-data-[orientation=vertical]/timeline:translate-x-1/2',
						'even:**:data-[slot=timeline-separator]:group-data-[orientation=vertical]/timeline:-right-6',
						'even:**:data-[slot=timeline-separator]:group-data-[orientation=vertical]/timeline:left-auto',
						'even:**:data-[slot=timeline-separator]:group-data-[orientation=vertical]/timeline:translate-x-1/2'
					],

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
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}