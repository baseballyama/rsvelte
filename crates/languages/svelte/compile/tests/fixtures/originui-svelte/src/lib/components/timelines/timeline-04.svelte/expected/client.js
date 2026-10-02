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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Timeline_04($$anchor) {
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
						var fragment_3 = root_2();
						var node_1 = $.first_child(fragment_3);

						TimelineHeader(node_1, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_2 = $.first_child(fragment_4);

								TimelineSeparator(node_2, {});

								var node_3 = $.sibling(node_2, 2);

								TimelineTitle(node_3, {
									class: '-mt-0.5',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(item).title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								TimelineIndicator(node_4, {});
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_1, 2);

						TimelineContent(node_5, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_6 = root_1();
								var text_1 = $.first_child(fragment_6);
								var node_6 = $.sibling(text_1);

								TimelineDate(node_6, {
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