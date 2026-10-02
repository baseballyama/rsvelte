import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Timeline, TimelineContent, TimelineDate, TimelineItem } from '$lib/components/ui/timeline';

var root = $.from_html(` <!>`, 1);

export default function Timeline_09($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{
			date: new Date('2024-01-09T10:55:00'),
			description: 'System backup completed successfully.',
			id: 1
		},

		{
			date: new Date('2024-01-09T10:50:00'),
			description: 'User authentication service restarted due to configuration update.',
			id: 2
		},

		{
			date: new Date('2024-01-09T10:45:00'),
			description: 'Warning: High CPU usage detected on worker node-03.',
			id: 3
		},

		{
			date: new Date('2024-01-09T10:40:00'),
			description: 'New deployment initiated for api-service v2.1.0.',
			id: 4
		}
	];

	Timeline($$anchor, {
		class: 'divide-y rounded-lg border',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
				TimelineItem($$anchor, {
					get step() {
						return $.get(item).id;
					},
					class: 'm-0! px-4! py-3!',
					children: ($$anchor, $$slotProps) => {
						TimelineContent($$anchor, {
							class: 'text-foreground',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_4 = root();
								var text = $.first_child(fragment_4);
								var node_1 = $.sibling(text);

								TimelineDate(node_1, {
									class: 'mt-1',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(
											($0, $1) => $.set_text(text_1, `${$0 ?? ''}
					at
					${$1 ?? ''}`),
											[
												() => $.get(item).date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
												() => $.get(item).date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: '2-digit' })
											]
										);

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								$.template_effect(() => $.set_text(text, `${$.get(item).description ?? ''} `));
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

	$.pop();
}