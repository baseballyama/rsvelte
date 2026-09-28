import * as $ from 'svelte/internal/server';
import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
import IconButton, { Icon } from '@smui/icon-button';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _Static($$renderer) {
	let prominent = false;
	let dense = false;
	let secondaryColor = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Prominent`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return prominent;
						},

						set checked($$value) {
							prominent = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Dense`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return dense;
						},

						set checked($$value) {
							dense = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

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

		$$renderer.push(`<!----></div> <div class="flexy svelte-3e37l3"><div class="top-app-bar-container flexor svelte-3e37l3">`);

		TopAppBar($$renderer, {
			variant: 'static',
			prominent,
			dense,
			color: secondaryColor ? 'secondary' : 'primary',
			children: ($$renderer) => {
				Row($$renderer, {
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

								$$renderer.push(`<!----> `);

								Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Flex Static`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Section($$renderer, {
							align: 'end',
							toolbar: true,
							children: ($$renderer) => {
								IconButton($$renderer, {
									'aria-label': 'Download',
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->file_download`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								IconButton($$renderer, {
									'aria-label': 'Print this page',
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->print`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								IconButton($$renderer, {
									'aria-label': 'Bookmark this page',
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->bookmark`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="flexor-content svelte-3e37l3">`);
		LoremIpsum($$renderer, {});
		$$renderer.push(`<!----> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div></div> <div class="top-app-bar-container svelte-3e37l3">`);

		TopAppBar($$renderer, {
			variant: 'static',
			prominent,
			dense,
			color: secondaryColor ? 'secondary' : 'primary',
			children: ($$renderer) => {
				Row($$renderer, {
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

								$$renderer.push(`<!----> `);

								Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Static`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Section($$renderer, {
							align: 'end',
							toolbar: true,
							children: ($$renderer) => {
								IconButton($$renderer, {
									'aria-label': 'Download',
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->file_download`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								IconButton($$renderer, {
									'aria-label': 'Print this page',
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->print`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								IconButton($$renderer, {
									'aria-label': 'Bookmark this page',
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->bookmark`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div>`);
		LoremIpsum($$renderer, {});
		$$renderer.push(`<!----> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}