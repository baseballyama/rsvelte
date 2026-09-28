import * as $ from 'svelte/internal/server';
import BottomAppBar, { Section } from '@smui-extra/bottom-app-bar';
import IconButton, { Icon } from '@smui/icon-button';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _Static($$renderer) {
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

		$$renderer.push(`<!----></div> <div class="flexy svelte-1j1goll"><div class="bottom-app-bar-container flexor svelte-1j1goll"><div class="flexor-content svelte-1j1goll"><h5>Flex Static</h5> `);
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

		$$renderer.push(`<!----></div> <div class="bottom-app-bar-container svelte-1j1goll"><div><h5>Static</h5> `);
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

		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}