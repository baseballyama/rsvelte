import * as $ from 'svelte/internal/server';
import BottomAppBar, { Section, AutoAdjust } from '@smui-extra/bottom-app-bar';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import { Icon } from '@smui/common';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _page($$renderer) {
	let bottomAppBar = null;
	let snackbar = void 0;
	let withFab = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		AutoAdjust($$renderer, {
			bottomAppBar,
			children: ($$renderer) => {
				$$renderer.push(`<h5>Standard</h5> <div>`);

				{
					function label($$renderer) {
						$$renderer.push(`<!---->With FAB`);
					}

					FormField($$renderer, {
						label,
						children: ($$renderer) => {
							Checkbox($$renderer, {
								get checked() {
									return withFab;
								},

								set checked($$value) {
									withFab = $$value;
									$$settled = false;
								}
							});
						},
						$$slots: { label: true, default: true }
					});
				}

				$$renderer.push(`<!----></div> `);

				Button($$renderer, {
					onclick: () => snackbar?.open(),
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open Snackbar`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Snackbar($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->This is a snackbar.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Actions($$renderer, {
							children: ($$renderer) => {
								IconButton($$renderer, {
									title: 'Dismiss',
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->close`);
											},
											$$slots: { default: true }
										});
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
				LoremIpsum($$renderer, {});
				$$renderer.push(`<!----> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		BottomAppBar($$renderer, {
			children: ($$renderer) => {
				Section($$renderer, {
					children: ($$renderer) => {
						IconButton($$renderer, {
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->menu`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (withFab) {
					$$renderer.push('<!--[0-->');

					Section($$renderer, {
						fabInset: true,
						children: ($$renderer) => {
							Fab($$renderer, {
								'aria-label': 'New item',
								children: ($$renderer) => {
									Icon($$renderer, {
										class: 'material-icons',
										children: ($$renderer) => {
											$$renderer.push(`<!---->add`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				Section($$renderer, {
					children: ($$renderer) => {
						IconButton($$renderer, {
							'aria-label': 'Search',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->search`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						IconButton($$renderer, {
							'aria-label': 'More',
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}