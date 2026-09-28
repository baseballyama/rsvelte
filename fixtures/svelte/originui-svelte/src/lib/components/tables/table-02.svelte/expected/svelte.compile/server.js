import * as $ from 'svelte/internal/server';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

export default function Table_02($$renderer) {
	const items = [
		{
			balance: '$1,250.00',
			email: 'alex.t@company.com',
			id: '1',
			image: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358071/avatar-40-02_upqrxi.jpg',
			location: 'San Francisco, US',
			name: 'Alex Thompson',
			status: 'Active',
			username: '@alexthompson'
		},

		{
			balance: '$600.00',
			email: 'sarah.c@company.com',
			id: '2',
			image: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358073/avatar-40-01_ij9v7j.jpg',
			location: 'Singapore',
			name: 'Sarah Chen',
			status: 'Active',
			username: '@sarahchen'
		},

		{
			balance: '$0.00',
			email: 'm.garcia@company.com',
			id: '4',
			image: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358072/avatar-40-03_dkeufx.jpg',
			location: 'Madrid, Spain',
			name: 'Maria Garcia',
			status: 'Active',
			username: '@mariagarcia'
		},

		{
			balance: '-$1,000.00',
			email: 'd.kim@company.com',
			id: '5',
			image: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358070/avatar-40-05_cmz0mg.jpg',
			location: 'Seoul, KR',
			name: 'David Kim',
			status: 'Active',
			username: '@davidkim'
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
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-center gap-3"><img class="rounded-full"${$.attr('src', item.image)}${$.attr('width', 40)}${$.attr('height', 40)}${$.attr('alt', item.name)}/> <div><div class="font-medium">${$.escape(item.name)}</div> <span class="text-muted-foreground mt-0.5 text-xs">${$.escape(item.username)}</span></div></div>`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="text-muted-foreground mt-4 text-center text-sm">Table with images</p></div>`);
}