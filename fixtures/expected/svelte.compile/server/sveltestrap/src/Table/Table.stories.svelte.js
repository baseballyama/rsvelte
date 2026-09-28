import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Column } from '@sveltestrap/sveltestrap';
import Table from './Table.svelte';

export const meta = {
	title: 'Stories/Table',
	component: Table,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		size: { control: { type: 'select' }, options: ['sm', 'lg'] },
		bordered: { control: 'boolean' },
		borderless: { control: 'boolean' },
		striped: { control: 'boolean' },
		hover: { control: 'boolean' },
		responsive: { control: 'boolean' },
		rows: { control: 'object', table: { disable: true } },
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: {
		size: 'lg',
		bordered: false,
		borderless: false,
		striped: false,
		hover: false,
		responsive: false
	}
};

export default function Table_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ROWS = [
			{
				first: 'Rufus',
				last: 'Sarsparilla',
				email: 'rufus.sarsparilla@example.com',
				dob: new Date(1968, 6, 15)
			},

			{
				first: 'Albert',
				last: 'Armadillo',
				email: 'albert.armadillo@example.com',
				dob: new Date(1972, 7, 17)
			},

			{
				first: 'Arron',
				last: 'Douglas',
				email: 'arron.douglas@example.com',
				dob: new Date(1982, 4, 1)
			},

			{
				first: 'Reginald',
				last: 'Rhodes',
				email: 'reginald.rhodes@example.com',
				dob: new Date(1968, 8, 14)
			},

			{
				first: 'Jimmy',
				last: 'Mendoza',
				email: 'jimmy.mendoza@example.com',
				dob: new Date(1964, 1, 1)
			},

			{
				first: 'Georgia',
				last: 'Montgomery',
				email: 'georgia.montgomery@example.com',
				dob: new Date(1960, 6, 4)
			},

			{
				first: 'Serenity',
				last: 'Thomas',
				email: 'serenity.thomas@example.com',
				dob: new Date(1973, 0, 11)
			},

			{
				first: 'Tonya',
				last: 'Elliott',
				email: 'tonya.elliott@example.com',
				dob: new Date(1954, 7, 17)
			},

			{
				first: 'Maxine',
				last: 'Turner',
				email: 'maxine.turner@example.com',
				dob: new Date(1961, 8, 19)
			},

			{
				first: 'Max',
				last: 'Headroom',
				email: 'max.headroom@example.com',
				dob: new Date(1984, 6, 1)
			}
		];

		const basicSource = `<Table>
  <thead>
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Username</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>Larry</td>
      <td>the Bird</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>`;

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Table($$renderer, $.spread_props([
						args,
						{
							children: ($$renderer) => {
								$$renderer.push(`<thead><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Username</th>`);

								if (args.responsive) {
									$$renderer.push(`<!--[0--><!--[-->`);

									const each_array = $.ensure_array_like(Array(10));

									for (let count = 0, $$length = each_array.length; count < $$length; count++) {
										let _ = each_array[count];

										$$renderer.push(`<th>Header ${$.escape(count + 4)}</th>`);
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></tr></thead> <tbody><tr><th scope="row">1</th><td>Mark</td><td>Otto</td><td>@mdo</td>`);

								if (args.responsive) {
									$$renderer.push(`<!--[0--><!--[-->`);

									const each_array_1 = $.ensure_array_like(Array(10));

									for (let count = 0, $$length = each_array_1.length; count < $$length; count++) {
										let _ = each_array_1[count];

										$$renderer.push(`<td>Cell ${$.escape(count + 4)}</td>`);
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></tr><tr><th scope="row">2</th><td>Jacob</td><td>Thornton</td><td>@fat</td>`);

								if (args.responsive) {
									$$renderer.push(`<!--[0--><!--[-->`);

									const each_array_2 = $.ensure_array_like(Array(10));

									for (let count = 0, $$length = each_array_2.length; count < $$length; count++) {
										let _ = each_array_2[count];

										$$renderer.push(`<td>Cell ${$.escape(count + 4)}</td>`);
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></tr><tr><th scope="row">3</th><td>Larry</td><td>the Bird</td><td>@twitter</td>`);

								if (args.responsive) {
									$$renderer.push(`<!--[0--><!--[-->`);

									const each_array_3 = $.ensure_array_like(Array(10));

									for (let count = 0, $$length = each_array_3.length; count < $$length; count++) {
										let _ = each_array_3[count];

										$$renderer.push(`<td>Cell ${$.escape(count + 4)}</td>`);
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></tr></tbody>`);
							},
							$$slots: { default: true }
						}
					]));
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Basic', source: basicSource });
		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Bordered', args: { bordered: true } });
		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Borderless', args: { borderless: true } });
		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Hover', args: { hover: true } });
		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Striped', args: { striped: true } });
		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Sizes', args: { size: 'sm' } });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Responsive',
			children: ($$renderer) => {
				Table($$renderer, {
					responsive: true,
					children: ($$renderer) => {
						$$renderer.push(`<thead><tr><th>#</th><!--[-->`);

						const each_array_4 = $.ensure_array_like(Array(15));

						for (let count = 0, $$length = each_array_4.length; count < $$length; count++) {
							let _ = each_array_4[count];

							$$renderer.push(`<th>Header ${$.escape(count + 1)}</th>`);
						}

						$$renderer.push(`<!--]--></tr></thead> <tbody><tr><th scope="row">1</th><!--[-->`);

						const each_array_5 = $.ensure_array_like(Array(15));

						for (let count = 0, $$length = each_array_5.length; count < $$length; count++) {
							let _ = each_array_5[count];

							$$renderer.push(`<td>Cell ${$.escape(count + 1)}</td>`);
						}

						$$renderer.push(`<!--]--></tr><tr><th scope="row">2</th><!--[-->`);

						const each_array_6 = $.ensure_array_like(Array(15));

						for (let count = 0, $$length = each_array_6.length; count < $$length; count++) {
							let _ = each_array_6[count];

							$$renderer.push(`<td>Cell ${$.escape(count + 1)}</td>`);
						}

						$$renderer.push(`<!--]--></tr><tr><th scope="row">3</th><!--[-->`);

						const each_array_7 = $.ensure_array_like(Array(15));

						for (let count = 0, $$length = each_array_7.length; count < $$length; count++) {
							let _ = each_array_7[count];

							$$renderer.push(`<td>Cell ${$.escape(count + 1)}</td>`);
						}

						$$renderer.push(`<!--]--></tr></tbody>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Columns',
			children: ($$renderer) => {
				Table($$renderer, {
					rows: ROWS,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { row }) => {
							Column($$renderer, {
								header: 'First Name',
								width: '8rem',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(row.first)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Column($$renderer, {
								header: 'Last Name',
								width: '8rem',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(row.last)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Column($$renderer, {
								header: 'Email',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(row.email)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Column($$renderer, {
								header: 'Birthdate',
								width: '10rem',
								class: 'text-right',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(row.dob.toDateString())}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}