import 'svelte/internal/disclose-version';
import Table from './Table.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Column } from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`<th></th>`);
var root_1 = $.from_html(`<td></td>`);
var root_2 = $.from_html(`<thead><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Username</th><!></tr></thead> <tbody><tr><th scope="row">1</th><td>Mark</td><td>Otto</td><td>@mdo</td><!></tr><tr><th scope="row">2</th><td>Jacob</td><td>Thornton</td><td>@fat</td><!></tr><tr><th scope="row">3</th><td>Larry</td><td>the Bird</td><td>@twitter</td><!></tr></tbody>`, 1);
var root_3 = $.from_html(`<thead><tr><th>#</th><!></tr></thead> <tbody><tr><th scope="row">1</th><!></tr><tr><th scope="row">2</th><!></tr><tr><th scope="row">3</th><!></tr></tbody>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Table_stories($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_5();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Table($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var thead = $.first_child(fragment_2);
						var tr = $.child(thead);
						var node_1 = $.sibling($.child(tr), 4);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.each(node_2, 16, () => Array(10), $.index, ($$anchor, _, count) => {
									var th = root();

									th.textContent = `Header ${count + 4}`;
									$.append($$anchor, th);
								});

								$.append($$anchor, fragment_3);
							};

							$.if(node_1, ($$render) => {
								if ($.get(args).responsive) $$render(consequent);
							});
						}

						$.reset(tr);
						$.reset(thead);

						var tbody = $.sibling(thead, 2);
						var tr_1 = $.child(tbody);
						var node_3 = $.sibling($.child(tr_1), 4);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								$.each(node_4, 16, () => Array(10), $.index, ($$anchor, _, count) => {
									var td = root_1();

									td.textContent = `Cell ${count + 4}`;
									$.append($$anchor, td);
								});

								$.append($$anchor, fragment_4);
							};

							$.if(node_3, ($$render) => {
								if ($.get(args).responsive) $$render(consequent_1);
							});
						}

						$.reset(tr_1);

						var tr_2 = $.sibling(tr_1);
						var node_5 = $.sibling($.child(tr_2), 4);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_6 = $.first_child(fragment_5);

								$.each(node_6, 16, () => Array(10), $.index, ($$anchor, _, count) => {
									var td_1 = root_1();

									td_1.textContent = `Cell ${count + 4}`;
									$.append($$anchor, td_1);
								});

								$.append($$anchor, fragment_5);
							};

							$.if(node_5, ($$render) => {
								if ($.get(args).responsive) $$render(consequent_2);
							});
						}

						$.reset(tr_2);

						var tr_3 = $.sibling(tr_2);
						var node_7 = $.sibling($.child(tr_3), 4);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_6 = $.comment();
								var node_8 = $.first_child(fragment_6);

								$.each(node_8, 16, () => Array(10), $.index, ($$anchor, _, count) => {
									var td_2 = root_1();

									td_2.textContent = `Cell ${count + 4}`;
									$.append($$anchor, td_2);
								});

								$.append($$anchor, fragment_6);
							};

							$.if(node_7, ($$render) => {
								if ($.get(args).responsive) $$render(consequent_3);
							});
						}

						$.reset(tr_3);
						$.reset(tbody);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_9 = $.sibling(node, 2);

	Story(node_9, { name: 'Basic', source: basicSource });

	var node_10 = $.sibling(node_9, 2);

	Story(node_10, { name: 'Bordered', args: { bordered: true } });

	var node_11 = $.sibling(node_10, 2);

	Story(node_11, { name: 'Borderless', args: { borderless: true } });

	var node_12 = $.sibling(node_11, 2);

	Story(node_12, { name: 'Hover', args: { hover: true } });

	var node_13 = $.sibling(node_12, 2);

	Story(node_13, { name: 'Striped', args: { striped: true } });

	var node_14 = $.sibling(node_13, 2);

	Story(node_14, { name: 'Sizes', args: { size: 'sm' } });

	var node_15 = $.sibling(node_14, 2);

	Story(node_15, {
		name: 'Responsive',
		children: ($$anchor, $$slotProps) => {
			Table($$anchor, {
				responsive: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_3();
					var thead_1 = $.first_child(fragment_8);
					var tr_4 = $.child(thead_1);
					var node_16 = $.sibling($.child(tr_4));

					$.each(node_16, 16, () => Array(15), $.index, ($$anchor, _, count) => {
						var th_1 = root();

						th_1.textContent = `Header ${count + 1}`;
						$.append($$anchor, th_1);
					});

					$.reset(tr_4);
					$.reset(thead_1);

					var tbody_1 = $.sibling(thead_1, 2);
					var tr_5 = $.child(tbody_1);
					var node_17 = $.sibling($.child(tr_5));

					$.each(node_17, 16, () => Array(15), $.index, ($$anchor, _, count) => {
						var td_3 = root_1();

						td_3.textContent = `Cell ${count + 1}`;
						$.append($$anchor, td_3);
					});

					$.reset(tr_5);

					var tr_6 = $.sibling(tr_5);
					var node_18 = $.sibling($.child(tr_6));

					$.each(node_18, 16, () => Array(15), $.index, ($$anchor, _, count) => {
						var td_4 = root_1();

						td_4.textContent = `Cell ${count + 1}`;
						$.append($$anchor, td_4);
					});

					$.reset(tr_6);

					var tr_7 = $.sibling(tr_6);
					var node_19 = $.sibling($.child(tr_7));

					$.each(node_19, 16, () => Array(15), $.index, ($$anchor, _, count) => {
						var td_5 = root_1();

						td_5.textContent = `Cell ${count + 1}`;
						$.append($$anchor, td_5);
					});

					$.reset(tr_7);
					$.reset(tbody_1);
					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_15, 2);

	Story(node_20, {
		name: 'Columns',
		children: ($$anchor, $$slotProps) => {
			Table($$anchor, {
				get rows() {
					return ROWS;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const row = $.derived(() => $$slotProps.row);
						var fragment_10 = root_4();
						var node_21 = $.first_child(fragment_10);

						Column(node_21, {
							header: 'First Name',
							width: '8rem',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $.get(row).first));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_22 = $.sibling(node_21, 2);

						Column(node_22, {
							header: 'Last Name',
							width: '8rem',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, $.get(row).last));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_23 = $.sibling(node_22, 2);

						Column(node_23, {
							header: 'Email',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, $.get(row).email));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_24 = $.sibling(node_23, 2);

						Column(node_24, {
							header: 'Birthdate',
							width: '10rem',
							class: 'text-right',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text();

								$.template_effect(($0) => $.set_text(text_3, $0), [() => $.get(row).dob.toDateString()]);
								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_10);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}