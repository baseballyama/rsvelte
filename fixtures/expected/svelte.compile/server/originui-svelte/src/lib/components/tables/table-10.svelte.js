import * as $ from 'svelte/internal/server';

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

export default function Table_10($$renderer) {
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
		},

		{
			balance: '$1,500.00',
			email: 'john.brown@company.com',
			id: '6',
			location: 'New York, US',
			name: 'John Brown',
			status: 'Active'
		},

		{
			balance: '$200.00',
			email: 'jane.doe@company.com',
			id: '7',
			location: 'Paris, FR',
			name: 'Jane Doe',
			status: 'Inactive'
		},

		{
			balance: '$1,000.00',
			email: 'peter.smith@company.com',
			id: '8',
			location: 'Berlin, DE',
			name: 'Peter Smith',
			status: 'Active'
		},

		{
			balance: '$500.00',
			email: 'olivia.lee@company.com',
			id: '9',
			location: 'Tokyo, JP',
			name: 'Olivia Lee',
			status: 'Active'
		},

		{
			balance: '$300.00',
			email: 'liam.chen@company.com',
			id: '10',
			location: 'Shanghai, CN',
			name: 'Liam Chen',
			status: 'Inactive'
		},

		{
			balance: '$800.00',
			email: 'ethan.kim@company.com',
			id: '11',
			location: 'Busan, KR',
			name: 'Ethan Kim',
			status: 'Active'
		},

		{
			balance: '$1,200.00',
			email: 'ava.brown@company.com',
			id: '12',
			location: 'London, UK',
			name: 'Ava Brown',
			status: 'Active'
		},

		{
			balance: '$400.00',
			email: 'lily.lee@company.com',
			id: '13',
			location: 'Seoul, KR',
			name: 'Lily Lee',
			status: 'Active'
		},

		{
			balance: '$600.00',
			email: 'noah.smith@company.com',
			id: '14',
			location: 'New York, US',
			name: 'Noah Smith',
			status: 'Inactive'
		},

		{
			balance: '$1,800.00',
			email: 'eve.chen@company.com',
			id: '15',
			location: 'Taipei, TW',
			name: 'Eve Chen',
			status: 'Active'
		}
	];

	$$renderer.push(`<div><div class="[&amp;>div]:max-h-96">`);

	Table($$renderer, {
		class: '[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b',
		children: ($$renderer) => {
			TableHeader($$renderer, {
				class: 'bg-background/90 sticky top-0 z-10 backdrop-blur-xs',
				children: ($$renderer) => {
					TableRow($$renderer, {
						class: 'hover:bg-transparent',
						children: ($$renderer) => {
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
							children: ($$renderer) => {
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
								colspan: 4,
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

	$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-8 text-center text-sm">Table with sticky header</p></div>`);
}