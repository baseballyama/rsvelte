import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(` <span class="text-muted-foreground text-sm font-normal"> </span>`, 1);
var root_1 = $.from_html(`<enhanced:img class="size-6 rounded-full"></enhanced:img>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(` <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Timeline_07($$anchor) {
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

	Timeline($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
				TimelineItem($$anchor, {
					get step() {
						return $.get(item).id;
					},
					class: 'not-last:group-data-[orientation=vertical]/timeline:ms-10 not-last:group-data-[orientation=vertical]/timeline:pb-8',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_4();
						var node_1 = $.first_child(fragment_3);

						TimelineHeader(node_1, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_2();
								var node_2 = $.first_child(fragment_4);

								TimelineSeparator(node_2, {
									class: 'group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5'
								});

								var node_3 = $.sibling(node_2, 2);

								TimelineTitle(node_3, {
									class: 'mt-0.5',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_5 = root();
										var text = $.first_child(fragment_5);
										var span = $.sibling(text);
										var text_1 = $.only_child(span, true);

										$.template_effect(() => {
											$.set_text(text, `${$.get(item).title ?? ''} `);
											$.set_text(text_1, $.get(item).action);
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								TimelineIndicator(node_4, {
									class: 'bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7',
									children: ($$anchor, $$slotProps) => {
										var enhanced_img = root_1();

										$.template_effect(() => {
											$.set_attribute(enhanced_img, 'src', $.get(item).image);
											$.set_attribute(enhanced_img, 'alt', $.get(item).title);
										});

										$.append($$anchor, enhanced_img);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_1, 2);

						TimelineContent(node_5, {
							class: 'text-foreground mt-2 rounded-lg border px-4 py-3',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_6 = root_3();
								var text_2 = $.first_child(fragment_6);
								var node_6 = $.sibling(text_2);

								TimelineDate(node_6, {
									class: 'mt-1 mb-0',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(() => $.set_text(text_3, $.get(item).date));
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								$.template_effect(() => $.set_text(text_2, `${$.get(item).description ?? ''} `));
								$.append($$anchor, fragment_6);
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