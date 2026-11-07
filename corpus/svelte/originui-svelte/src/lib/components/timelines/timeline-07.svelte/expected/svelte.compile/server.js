import * as $ from 'svelte/internal/server';
import Avatar01 from '$lib/assets/avatar-40-01.jpg?w=48&h=48&enhanced';
import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=48&h=48&enhanced';
import Avatar03 from '$lib/assets/avatar-40-03.jpg?w=48&h=48&enhanced';
import Avatar05 from '$lib/assets/avatar-40-05.jpg?w=48&h=48&enhanced';

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

export default function Timeline_07($$renderer) {
	const items = [
		{
			action: 'opened a new issue',
			date: '15 minutes ago',
			description: "I'm having trouble with the new component library. It's not rendering properly.",
			id: 1,
			image: Avatar01,
			title: 'Hannah Kandell'
		},

		{
			action: 'commented on',
			date: '10 minutes ago',
			description: "Hey Hannah, I'm having trouble with the new component library. It's not rendering properly.",
			id: 2,
			image: Avatar02,
			title: 'Chris Tompson'
		},

		{
			action: 'assigned you to',
			date: '5 minutes ago',
			description: 'The new component library is not rendering properly. Can you take a look?',
			id: 3,
			image: Avatar03,
			title: 'Emma Davis'
		},

		{
			action: 'closed the issue',
			date: '2 minutes ago',
			description: 'The issue has been fixed. Please review the changes.',
			id: 4,
			image: Avatar05,
			title: 'Alex Morgan'
		}
	];

	Timeline($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				TimelineItem($$renderer, {
					step: item.id,
					class: 'not-last:group-data-[orientation=vertical]/timeline:ms-10 not-last:group-data-[orientation=vertical]/timeline:pb-8',
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
										$$renderer.push(`<!---->${$.escape(item.title)} <span class="text-muted-foreground text-sm font-normal">${$.escape(item.action)}</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TimelineIndicator($$renderer, {
									class: 'bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7',
									children: ($$renderer) => {
										$$renderer.push(`<enhanced:img${$.attr('src', item.image)}${$.attr('alt', item.title)} class="size-6 rounded-full"></enhanced:img>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TimelineContent($$renderer, {
							class: 'text-foreground mt-2 rounded-lg border px-4 py-3',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(item.description)} `);

								TimelineDate($$renderer, {
									class: 'mt-1 mb-0',
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