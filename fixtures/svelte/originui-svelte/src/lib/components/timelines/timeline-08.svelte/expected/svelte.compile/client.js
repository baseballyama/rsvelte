import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Timeline,
	TimelineDate,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle
} from '$lib/components/ui/timeline';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Timeline_08($$anchor) {
	const items = [
		{ date: 'Mar 15, 2024', id: 1, title: 'Project Kickoff' },
		{ date: 'Mar 22, 2024', id: 2, title: 'Design Phase' },
		{ date: 'Apr 5, 2024', id: 3, title: 'Development Sprint' },
		{ date: 'Apr 19, 2024', id: 4, title: 'Testing & Deployment' },
		{ date: 'May 3, 2024', id: 5, title: 'User Training' },
		{ date: 'May 17, 2024', id: 6, title: 'Project Handover' }
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

					children: ($$anchor, $$slotProps) => {
						TimelineHeader($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_1 = $.first_child(fragment_4);

								TimelineSeparator(node_1, {});

								var node_2 = $.sibling(node_1, 2);

								TimelineDate(node_2, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(item).date));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								var node_3 = $.sibling(node_2, 2);

								TimelineTitle(node_3, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(item).title));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								TimelineIndicator(node_4, {});
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}