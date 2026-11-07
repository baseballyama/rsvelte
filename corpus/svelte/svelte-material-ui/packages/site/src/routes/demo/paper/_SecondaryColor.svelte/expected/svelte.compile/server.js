import * as $ from 'svelte/internal/server';
import Paper, { Title, Content } from '@smui/paper';

export default function _SecondaryColor($$renderer) {
	$$renderer.push(`<div class="paper-container">`);

	Paper($$renderer, {
		color: 'secondary',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Paper can have a color, allowing you to construct fancy school projects
      with the colored paper and glue sticks.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		color: 'secondary',
		variant: 'unelevated',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated Secondary Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated secondary paper is nice because it will pretty much always
      stand out, even in light mode.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		color: 'secondary',
		variant: 'outlined',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined Secondary Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined secondary paper has a neat border.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		color: 'secondary',
		variant: 'outlined',
		class: 'mdc-theme--secondary',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined Secondary Paper with Secondary Text`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined secondary paper with secondary color text. For the times when you
      need to draw attention.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}