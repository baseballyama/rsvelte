import * as $ from 'svelte/internal/server';
import { Timeline, TimelineContent, TimelineDate, TimelineItem } from '$lib/components/ui/timeline';

export default function Timeline_09($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Timeline($$renderer, {
			class: 'divide-y rounded-lg border',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					TimelineItem($$renderer, {
						step: item.id,
						class: 'm-0! px-4! py-3!',
						children: ($$renderer) => {
							TimelineContent($$renderer, {
								class: 'text-foreground',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(item.description)} `);

									TimelineDate($$renderer, {
										class: 'mt-1',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }))}
					at
					${$.escape(item.date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: '2-digit' }))}`);
										},
										$$slots: { default: true }
									});

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
	});
}