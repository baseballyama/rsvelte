import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Timeline,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle
} from '$lib/components/ui/timeline';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Timeline_01($$anchor) {
	const items = [
		{
			date: 'Mar 15, 2024',
			description: 'Initial team meeting and project scope definition. Established key milestones and resource allocation.',
			id: 1,
			title: 'Project Kickoff'
		},

		{
			date: 'Mar 22, 2024',
			description: 'Completed wireframes and user interface mockups. Stakeholder review and feedback incorporated.',
			id: 2,
			title: 'Design Phase'
		},

		{
			date: 'Apr 5, 2024',
			description: 'Backend API implementation and frontend component development in progress.',
			id: 3,
			title: 'Development Sprint'
		},

		{
			date: 'Apr 19, 2024',
			description: 'Quality assurance testing, performance optimization, and production deployment preparation.',
			id: 4,
			title: 'Testing & Deployment'
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

					children: ($$anchor, $$slotProps) => {
						TimelineHeader($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_1 = $.first_child(fragment_4);

								TimelineSeparator(node_1, {});

								var node_2 = $.sibling(node_1, 2);

								TimelineTitle(node_2, {
									class: '-mt-0.5',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(item).title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								var node_3 = $.sibling(node_2, 2);

								TimelineIndicator(node_3, {});
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