import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Timeline_12($$anchor) {
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

	Timeline($$anchor, {
		defaultValue: 3,
		orientation: 'horizontal',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
				TimelineItem($$anchor, {
					get step() {
						return $.get(item).id;
					},
					class: 'group-data-[orientation=horizontal]/timeline:mt-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_1 = $.first_child(fragment_3);

						TimelineHeader(node_1, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_2 = $.first_child(fragment_4);

								TimelineSeparator(node_2, { class: 'group-data-[orientation=horizontal]/timeline:top-8' });

								var node_3 = $.sibling(node_2, 2);

								TimelineDate(node_3, {
									class: 'mb-10',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(item).date));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								TimelineTitle(node_4, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(item).title));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_4, 2);

								TimelineIndicator(node_5, { class: 'group-data-[orientation=horizontal]/timeline:top-8' });
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_1, 2);

						TimelineContent(node_6, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, $.get(item).description));
								$.append($$anchor, text_2);
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