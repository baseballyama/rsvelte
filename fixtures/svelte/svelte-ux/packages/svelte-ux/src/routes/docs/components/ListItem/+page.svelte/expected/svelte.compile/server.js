import * as $ from 'svelte/internal/server';
import { mdiAccount, mdiChevronRight } from '@mdi/js';
import { Button, Checkbox, ListItem, Radio } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedId = 1;

		const choices = [
			{
				id: 1,
				name: 'Allow all actions',
				description: 'Any action can be used, regardless of who authored it or where it is defined.'
			},

			{
				id: 2,
				name: 'Disable actions',
				description: 'The Actions tab is hidden and no workflows can run.'
			},

			{
				id: 3,
				name: 'Allow local actions only',
				description: 'Only actions defined in a repository within techniq can be used.'
			},

			{
				id: 4,
				name: 'Allow select actions',
				description: 'Only actions that match specified criteria, plus actions defined in a repository within techniq, can be used.'
			}
		];

		$$renderer.push(`<h1>Examples</h1> <h2>Title only</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ListItem($$renderer, { title: 'Title' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Title with subheading</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ListItem($$renderer, { title: 'Title', subheading: 'Subheading' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ListItem($$renderer, { title: 'Title', icon: mdiAccount });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon with subheading</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ListItem($$renderer, { title: 'Title', subheading: 'Subheading', icon: mdiAccount });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon with classes</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ListItem($$renderer, {
					title: 'Title',
					subheading: 'Subheading',
					icon: mdiAccount,
					avatar: { class: 'bg-surface-content/50 text-surface-100/90' }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Actions</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ListItem($$renderer, {
					title: 'Title',
					$$slots: {
						actions: ($$renderer) => {
							$$renderer.push(`<div slot="actions">`);
							Button($$renderer, { icon: mdiChevronRight, class: 'p-2 text-surface-content/50' });
							$$renderer.push(`<!----></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Multiple</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ListItem($$renderer, { title: 'Title' });
				$$renderer.push(`<!----> `);
				ListItem($$renderer, { title: 'Title' });
				$$renderer.push(`<!----> `);
				ListItem($$renderer, { title: 'Title' });
				$$renderer.push(`<!----> `);
				ListItem($$renderer, { title: 'Title' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Loading</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ListItem($$renderer, { title: 'Title', subheading: 'Subheading' });
				$$renderer.push(`<!----> `);
				ListItem($$renderer, { title: 'Title', subheading: 'Subheading' });
				$$renderer.push(`<!----> `);
				ListItem($$renderer, { title: 'Title', subheading: 'Subheading', loading: true });
				$$renderer.push(`<!----> `);
				ListItem($$renderer, { title: 'Title', subheading: 'Subheading' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Radio Group</h2> <h3>example 1</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="rounded border"><!--[-->`);

				const each_array = $.ensure_array_like(choices);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let choice = each_array[$$index];

					ListItem($$renderer, {
						title: choice.name,
						subheading: choice.description,
						class: cls('cursor-pointer', 'hover:bg-primary/5', selectedId == choice.id ? 'bg-primary/5' : ''),
						$$slots: {
							avatar: ($$renderer) => {
								$$renderer.push(`<div slot="avatar" class="contents">`);
								Radio($$renderer, { checked: selectedId === choice.id });
								$$renderer.push(`<!----></div>`);
							}
						}
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Radio Group</h2> <h3>example 2</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-4"><!--[-->`);

				const each_array_1 = $.ensure_array_like(choices);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let choice = each_array_1[$$index_1];

					$$renderer.push(`<div class="elevation-1 rounded">`);

					ListItem($$renderer, {
						title: choice.name,
						subheading: choice.description,
						class: cls('px-8 py-4', 'cursor-pointer ring ring-inset ring-primary transition-shadow duration-100', 'hover:bg-primary/5', selectedId == choice.id ? 'ring-1 bg-primary/5' : 'ring-0'),
						noShadow: true
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h3>example 3</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-4 bg-surface-200 p-4"><!--[-->`);

				const each_array_2 = $.ensure_array_like(choices);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let choice = each_array_2[$$index_2];

					$$renderer.push(`<div>`);

					ListItem($$renderer, {
						title: choice.name,
						subheading: choice.description,
						class: cls('px-8 py-4', 'cursor-pointer transition-shadow duration-100', 'hover:bg-surface-100 hover:outline', selectedId == choice.id ? 'bg-surface-100 shadow-md' : ''),
						noBackground: true,
						noShadow: true,
						$$slots: {
							actions: ($$renderer) => {
								$$renderer.push(`<div slot="actions">`);
								Checkbox($$renderer, { circle: true, dense: true, checked: selectedId == choice.id });
								$$renderer.push(`<!----></div>`);
							}
						}
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}