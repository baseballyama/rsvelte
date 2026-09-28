import * as $ from 'svelte/internal/server';
import Paper, { Title, Content } from '@smui/paper';

export default function _PrimaryColor($$renderer) {
	$$renderer.push(`<div class="paper-container">`);

	Paper($$renderer, {
		color: 'primary',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Primary Paper`);
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
		color: 'primary',
		variant: 'unelevated',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated Primary Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated primary paper is nice because it will pretty much always stand
      out, even in light mode.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		color: 'primary',
		variant: 'outlined',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined Primary Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined primary paper has a neat border.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		color: 'primary',
		variant: 'outlined',
		class: 'mdc-theme--primary',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined Primary Paper with Primary Text`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined primary paper with primary color text. For the times when you
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