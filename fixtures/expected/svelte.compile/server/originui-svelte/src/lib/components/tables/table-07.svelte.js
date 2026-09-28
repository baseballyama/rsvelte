import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

export default function Table_07($$renderer) {
	const id = $.props_id($$renderer);

	const items = [
		{
			balance: '$1,250.00',
			email: 'alex.t@company.com',
			id: '1',
			location: 'San Francisco, US',
			name: 'Alex Thompson',
			status: 'Active'
		},

		{
			balance: '$600.00',
			email: 'sarah.c@company.com',
			id: '2',
			location: 'Singapore',
			name: 'Sarah Chen',
			status: 'Active'
		},

		{
			balance: '$650.00',
			email: 'j.wilson@company.com',
			id: '3',
			location: 'London, UK',
			name: 'James Wilson',
			status: 'Inactive'
		},

		{
			balance: '$0.00',
			email: 'm.garcia@company.com',
			id: '4',
			location: 'Madrid, Spain',
			name: 'Maria Garcia',
			status: 'Active'
		},

		{
			balance: '-$1,000.00',
			email: 'd.kim@company.com',
			id: '5',
			location: 'Seoul, KR',
			name: 'David Kim',
			status: 'Active'
		}
	];

	$$renderer.push(`<div>`);

	Table($$renderer, {
		children: ($$renderer) => {
			TableHeader($$renderer, {
				children: ($$renderer) => {
					TableRow($$renderer, {
						class: 'hover:bg-transparent',
						children: ($$renderer) => {
							TableHead($$renderer, {
								children: ($$renderer) => {
									Checkbox($$renderer, { id });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Name`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Email`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Location`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Status`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'text-right',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Balance`);
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

			$$renderer.push(`<!----> `);

			TableBody($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						TableRow($$renderer, {
							class: 'has-data-[state=checked]:bg-muted/50',
							children: ($$renderer) => {
								TableCell($$renderer, {
									children: ($$renderer) => {
										Checkbox($$renderer, { id: `table-checkbox-${$.stringify(item.id)}` });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'font-medium',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.name)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.email)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.location)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.status)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TableCell($$renderer, {
									class: 'text-right',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.balance)}`);
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

			$$renderer.push(`<!----> `);

			TableFooter($$renderer, {
				class: 'bg-transparent',
				children: ($$renderer) => {
					TableRow($$renderer, {
						class: 'hover:bg-transparent',
						children: ($$renderer) => {
							TableCell($$renderer, {
								colspan: 5,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Total`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableCell($$renderer, {
								class: 'text-right',
								children: ($$renderer) => {
									$$renderer.push(`<!---->$2,500.00`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="text-muted-foreground mt-4 text-center text-sm">Table with row selection</p></div>`);
}