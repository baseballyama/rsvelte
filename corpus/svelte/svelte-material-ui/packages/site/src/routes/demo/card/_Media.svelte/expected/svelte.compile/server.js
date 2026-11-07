import * as $ from 'svelte/internal/server';
import Card, { Content, PrimaryAction, Media, MediaContent } from '@smui/card';

export default function _Media($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div class="card-display svelte-6fdquk"><div class="card-container svelte-6fdquk">`);

	Card($$renderer, {
		children: ($$renderer) => {
			Media($$renderer, {
				class: 'card-media-16x9',
				aspectRatio: '16x9',
				children: ($$renderer) => {
					MediaContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<h2 class="mdc-typography--headline6 svelte-6fdquk" style="color: #fff; position: absolute; bottom: 16px; left: 16px; margin: 0;">A card with 16x9 media.</h2>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Content($$renderer, {
				style: 'color: #888;',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Here's some gray text down here.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="card-container svelte-6fdquk">`);

	Card($$renderer, {
		style: 'min-width: 300px;',
		children: ($$renderer) => {
			Media($$renderer, {
				class: 'card-media-square',
				aspectRatio: 'square',
				children: ($$renderer) => {
					$$renderer.push(`<div style="color: #fff; position: absolute; bottom: 16px; left: 16px;" class="svelte-6fdquk"><h2 class="mdc-typography--headline6 svelte-6fdquk" style="margin: 0;">A card with square media.</h2> <h3 class="mdc-typography--subtitle2 svelte-6fdquk" style="margin: 0;">And a subtitle.</h3></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="card-container svelte-6fdquk">`);

	Card($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div style="padding: 1rem;" class="svelte-6fdquk"><h2 class="mdc-typography--headline6 svelte-6fdquk" style="margin: 0;">A card with media.</h2> <h3 class="mdc-typography--subtitle2 svelte-6fdquk" style="margin: 0; color: #888;">And a subtitle.</h3></div> `);

			PrimaryAction($$renderer, {
				onclick: () => clicked++,
				children: ($$renderer) => {
					Media($$renderer, { class: 'card-media-16x9', aspectRatio: '16x9' });
					$$renderer.push(`<!----> `);

					Content($$renderer, {
						class: 'mdc-typography--body2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->And some info text. And the media and info text are a primary action
          for the card.`);
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

	$$renderer.push(`<!----></div></div> <pre class="status svelte-6fdquk">Clicked: ${$.escape(clicked)}</pre>`);
}