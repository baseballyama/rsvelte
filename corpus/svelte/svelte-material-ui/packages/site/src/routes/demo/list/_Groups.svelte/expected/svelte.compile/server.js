import * as $ from 'svelte/internal/server';
import List, { Group, Item, Subheader, Text } from '@smui/list';

export default function _Groups($$renderer) {
	let clicked = 'nothing yet';

	$$renderer.push(`<div class="svelte-ba8yce">`);

	Group($$renderer, {
		children: ($$renderer) => {
			Subheader($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Actors`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			List($$renderer, {
				class: 'demo-list',
				children: ($$renderer) => {
					Item($$renderer, {
						onSMUIAction: () => clicked = 'Bruce Willis',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Bruce Willis`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Tom Hanks',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Tom Hanks`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Jack Nicholson',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Jack Nicholson`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Leonardo DiCaprio',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Leonardo DiCaprio`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Matt Damon',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Matt Damon`);
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

			Subheader($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Books`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			List($$renderer, {
				class: 'demo-list',
				children: ($$renderer) => {
					Item($$renderer, {
						onSMUIAction: () => clicked = 'To Kill a Mockingbird',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->To Kill a Mockingbird`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'The Great Gatsby',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->The Great Gatsby`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = '1984',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->1984`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Catch-22',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Catch-22`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = "Alice's Adventures in Wonderland",
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Alice's Adventures in Wonderland`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <pre class="status svelte-ba8yce">Clicked: ${$.escape(clicked)}</pre>`);
}