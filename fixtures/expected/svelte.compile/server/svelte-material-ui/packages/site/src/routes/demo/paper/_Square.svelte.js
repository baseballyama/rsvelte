import * as $ from 'svelte/internal/server';
import Paper, { Title, Content } from '@smui/paper';

export default function _Square($$renderer) {
	$$renderer.push(`<div class="paper-container">`);

	Paper($$renderer, {
		square: true,
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Square Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->By adding the <code>square</code> property, the paper gains sharper corners
      and can be used to intimidate foes.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		square: true,
		variant: 'unelevated',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated Square Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated square paper is pretty much a sheet of paper embedded in the
      floor.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Paper($$renderer, {
		square: true,
		variant: 'outlined',
		children: ($$renderer) => {
			Title($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined Square Paper`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined square paper... is it really paper anymore?`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}