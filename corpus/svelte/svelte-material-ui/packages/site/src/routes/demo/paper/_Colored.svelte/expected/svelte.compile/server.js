import * as $ from 'svelte/internal/server';
import Paper, { Title, Content } from '@smui/paper';

export default function _Colored($$renderer) {
	$$renderer.push(`<div class="paper-container">`);

	Paper($$renderer, {
		color: 'custom-green',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Custom Color Paper`);
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
		color: 'custom-green',
		variant: 'unelevated',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated Custom Color Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated custom color paper is nice because it will pretty much always
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
		color: 'custom-green',
		variant: 'outlined',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined Custom Color Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined custom color paper has a neat border.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		color: 'custom-green',
		variant: 'outlined',
		class: 'custom-green',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined Custom Color Paper with Custom Color Text`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined custom color paper with custom color color text. For the times
      when you need to draw attention.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}