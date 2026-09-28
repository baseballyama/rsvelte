import * as $ from 'svelte/internal/server';
import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
import Button, { Label } from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Actions($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div class="card-display"><div class="card-container">`);

	Card($$renderer, {
		children: ($$renderer) => {
			PrimaryAction($$renderer, {
				onclick: () => clicked++,
				padded: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Primary Action, a clickable area of the card.`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="card-container">`);

	Card($$renderer, {
		children: ($$renderer) => {
			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->A card with action buttons.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Actions($$renderer, {
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="card-container">`);

	Card($$renderer, {
		children: ($$renderer) => {
			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->A card with a full-bleed action.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Actions($$renderer, {
				fullBleed: true,
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

							$$renderer.push(`<!----> <i class="material-icons" aria-hidden="true">arrow_forward</i>`);
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

	$$renderer.push(`<!----></div> <div class="card-container">`);

	Card($$renderer, {
		children: ($$renderer) => {
			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->A card with action icons.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Actions($$renderer, {
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

	$$renderer.push(`<!----></div> <div class="card-container">`);

	Card($$renderer, {
		children: ($$renderer) => {
			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->A card with Both.`);
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

	$$renderer.push(`<!----></div></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}