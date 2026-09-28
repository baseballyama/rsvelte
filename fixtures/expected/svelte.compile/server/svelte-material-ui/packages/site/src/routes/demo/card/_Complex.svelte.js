import * as $ from 'svelte/internal/server';

import Card, {
	Content,
	PrimaryAction,
	Media,
	MediaContent,
	Actions,
	ActionButtons,
	ActionIcons
} from '@smui/card';

import Button, { Label } from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Complex($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div class="card-display svelte-36ac50"><div class="card-container svelte-36ac50">`);

	Card($$renderer, {
		class: 'mdc-elevation--z12',
		children: ($$renderer) => {
			PrimaryAction($$renderer, {
				onclick: () => clicked++,
				children: ($$renderer) => {
					Media($$renderer, {
						class: 'card-media-16x9',
						aspectRatio: '16x9',
						children: ($$renderer) => {
							MediaContent($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div style="color: #fff; position: absolute; bottom: 16px; left: 16px;" class="svelte-36ac50"><h2 class="mdc-typography--headline6 svelte-36ac50" style="margin: 0;">A card with media.</h2> <h3 class="mdc-typography--subtitle2 svelte-36ac50" style="margin: 0;">And a subtitle.</h3></div>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						class: 'mdc-typography--body2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->And higher elevation. It's all in this card. It's a veritable
          smorgasbord of card features.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Actions($$renderer, {
				children: ($$renderer) => {
					ActionButtons($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								onclick: () => clicked++,
								children: ($$renderer) => {
									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Action`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								onclick: () => clicked++,
								children: ($$renderer) => {
									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Another`);
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

					ActionIcons($$renderer, {
						children: ($$renderer) => {
							IconButton($$renderer, {
								onclick: () => clicked++,
								toggle: true,
								'aria-label': 'Add to favorites',
								title: 'Add to favorites',
								children: ($$renderer) => {
									Icon($$renderer, {
										class: 'material-icons',
										on: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->favorite`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Icon($$renderer, {
										class: 'material-icons',
										children: ($$renderer) => {
											$$renderer.push(`<!---->favorite_border`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							IconButton($$renderer, {
								onclick: () => clicked++,
								title: 'Share',
								children: ($$renderer) => {
									Icon($$renderer, {
										class: 'material-icons',
										children: ($$renderer) => {
											$$renderer.push(`<!---->share`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							IconButton($$renderer, {
								onclick: () => clicked++,
								title: 'More options',
								children: ($$renderer) => {
									Icon($$renderer, {
										class: 'material-icons',
										children: ($$renderer) => {
											$$renderer.push(`<!---->more_vert`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="card-container svelte-36ac50">`);

	Card($$renderer, {
		class: 'mdc-elevation--z12',
		children: ($$renderer) => {
			PrimaryAction($$renderer, {
				onclick: () => clicked++,
				children: ($$renderer) => {
					Media($$renderer, { class: 'card-media-16x9', aspectRatio: '16x9' });
					$$renderer.push(`<!----> `);

					Content($$renderer, {
						class: 'mdc-typography--body2',
						children: ($$renderer) => {
							$$renderer.push(`<h2 class="mdc-typography--headline6 svelte-36ac50" style="margin: 0;">A card with media.</h2> <h3 class="mdc-typography--subtitle2 svelte-36ac50" style="margin: 0 0 10px; color: #888;">And a subtitle.</h3> And higher elevation. It's all in this card. It's a veritable smorgasbord
          of card features.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Actions($$renderer, {
				children: ($$renderer) => {
					ActionButtons($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								onclick: () => clicked++,
								children: ($$renderer) => {
									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Action`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								onclick: () => clicked++,
								children: ($$renderer) => {
									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Another`);
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

					ActionIcons($$renderer, {
						children: ($$renderer) => {
							IconButton($$renderer, {
								onclick: () => clicked++,
								toggle: true,
								'aria-label': 'Add to favorites',
								title: 'Add to favorites',
								children: ($$renderer) => {
									Icon($$renderer, {
										class: 'material-icons',
										on: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->favorite`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Icon($$renderer, {
										class: 'material-icons',
										children: ($$renderer) => {
											$$renderer.push(`<!---->favorite_border`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							IconButton($$renderer, {
								onclick: () => clicked++,
								title: 'Share',
								children: ($$renderer) => {
									Icon($$renderer, {
										class: 'material-icons',
										children: ($$renderer) => {
											$$renderer.push(`<!---->share`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							IconButton($$renderer, {
								onclick: () => clicked++,
								title: 'More options',
								children: ($$renderer) => {
									Icon($$renderer, {
										class: 'material-icons',
										children: ($$renderer) => {
											$$renderer.push(`<!---->more_vert`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div> <pre class="status svelte-36ac50">Clicked: ${$.escape(clicked)}</pre>`);
}