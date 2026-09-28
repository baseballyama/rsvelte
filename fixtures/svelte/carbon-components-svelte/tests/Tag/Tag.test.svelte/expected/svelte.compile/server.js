import * as $ from 'svelte/internal/server';
import Tag from "carbon-components-svelte/Tag/Tag.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

export default function Tag_test($$renderer) {
	Tag($$renderer, {
		class: 'my-class',
		style: 'margin: 1rem;',
		children: ($$renderer) => {
			$$renderer.push(`<!---->IBM Cloud`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<!---->red`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'magenta',
		children: ($$renderer) => {
			$$renderer.push(`<!---->magenta`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'purple',
		children: ($$renderer) => {
			$$renderer.push(`<!---->purple`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'blue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'cyan',
		children: ($$renderer) => {
			$$renderer.push(`<!---->cyan`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'teal',
		children: ($$renderer) => {
			$$renderer.push(`<!---->teal`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<!---->green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'gray',
		children: ($$renderer) => {
			$$renderer.push(`<!---->gray`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'cool-gray',
		children: ($$renderer) => {
			$$renderer.push(`<!---->cool-gray`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'warm-gray',
		children: ($$renderer) => {
			$$renderer.push(`<!---->warm-gray`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'high-contrast',
		children: ($$renderer) => {
			$$renderer.push(`<!---->high-contrast`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		type: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->outline`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		filter: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Filterable`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		icon: Add,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom icon`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		interactive: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Tag($$renderer, { skeleton: true });
	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		size: 'lg',
		filter: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large filterable`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Tag($$renderer, { size: 'lg', skeleton: true });
	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		filter: true,
		disabled: true,
		title: 'Custom title',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled filterable`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		interactive: true,
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled interactive`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		inline: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		id: 'custom-tag-id',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom ID tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Mouse events`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		interactive: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Icon slot`);
		},

		$$slots: {
			default: true,
			icon: ($$renderer) => {
				Add($$renderer, { slot: 'icon' });
			}
		}
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		filter: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Filter click and close`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		href: '/filtered?tag=ml',
		type: 'blue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Linked tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		href: '/filtered?tag=ml',
		target: '_blank',
		children: ($$renderer) => {
			$$renderer.push(`<!---->External linked tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		href: '/filtered?tag=ml',
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled linked tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tag($$renderer, {
		filter: true,
		href: '/should-not-link',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Filter wins over href`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}