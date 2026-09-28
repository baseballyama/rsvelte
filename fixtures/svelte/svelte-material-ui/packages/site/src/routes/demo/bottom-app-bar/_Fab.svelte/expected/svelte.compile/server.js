import * as $ from 'svelte/internal/server';
import BottomAppBar, { Section } from '@smui-extra/bottom-app-bar';
import IconButton from '@smui/icon-button';
import Fab, { Icon } from '@smui/fab';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _Fab($$renderer) {
	let secondaryColor = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Secondary`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return secondaryColor;
						},

						set checked($$value) {
							secondaryColor = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div class="flexy svelte-idqu90"><div class="bottom-app-bar-container flexor svelte-idqu90"><div class="flexor-content svelte-idqu90"><h5>Centered FAB</h5> `);
		LoremIpsum($$renderer, {});
		$$renderer.push(`<!----> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div> `);

		BottomAppBar($$renderer, {
			variant: 'static',
			color: secondaryColor ? 'secondary' : 'primary',
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

				Section($$renderer, {
					children: ($$renderer) => {
						Fab($$renderer, {
							'aria-label': 'New item',
							color: secondaryColor ? 'primary' : 'secondary',
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

				$$renderer.push(`<!----> `);

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

		$$renderer.push(`<!----></div> <div class="bottom-app-bar-container flexor svelte-idqu90"><div class="flexor-content svelte-idqu90"><h5>Right FAB</h5> `);
		LoremIpsum($$renderer, {});
		$$renderer.push(`<!----> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div> `);

		BottomAppBar($$renderer, {
			variant: 'static',
			color: secondaryColor ? 'secondary' : 'primary',
			children: ($$renderer) => {
				Section($$renderer, {
					children: ($$renderer) => {
						IconButton($$renderer, {
							'aria-label': 'Archive',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->archive`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						IconButton($$renderer, {
							'aria-label': 'Mark unread',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->mail`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						IconButton($$renderer, {
							'aria-label': 'Label',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->label`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						IconButton($$renderer, {
							'aria-label': 'Trash',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->delete`);
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

				Section($$renderer, {
					children: ($$renderer) => {
						Fab($$renderer, {
							'aria-label': 'Reply',
							color: secondaryColor ? 'primary' : 'secondary',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->reply`);
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

		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}