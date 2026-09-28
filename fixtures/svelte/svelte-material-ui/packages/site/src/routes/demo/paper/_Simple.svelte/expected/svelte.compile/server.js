import * as $ from 'svelte/internal/server';
import Paper, { Title, Subtitle, Content } from '@smui/paper';

export default function _Simple($$renderer) {
	$$renderer.push(`<div class="paper-container">`);

	Paper($$renderer, {
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Subtitle($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is a sheet of paper.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Paper is used to build an elevated surface.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		variant: 'unelevated',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Subtitle($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is an unelevated sheet of paper.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated paper is used to build a surface.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		variant: 'outlined',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Subtitle($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is an outlined sheet of paper.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined paper is used to build a container.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}