import * as $ from 'svelte/internal/server';
import Dialog, { Title, Content } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import List, { Item, Text } from '@smui/list';

export default function _List($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let clicked = 'Nothing yet.';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Dialog($$renderer, {
				selection: true,
				'aria-labelledby': 'list-title',
				'aria-describedby': 'list-content',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Title($$renderer, {
						id: 'list-title',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dialog Title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						id: 'list-content',
						children: ($$renderer) => {
							List($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like([...Array(100)].map((_v, i) => i + 1));

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let item = each_array[$$index];

										Item($$renderer, {
											onclick: () => {
												clicked = item;
												open = false;
											},

											children: ($$renderer) => {
												Text($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Item #${$.escape(item)}`);
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
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: () => open = true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Dialog`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}${$.escape(clicked === 69
				? ', nice'
				: clicked === 42
					? ', the answer to life, the universe, and everything'
					: '')}</pre>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}