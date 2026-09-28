import * as $ from 'svelte/internal/server';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Icon($$renderer) {
	let panel1Open = false;
	let panel2Open = false;
	let panel3Open = false;
	let panel4Open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="accordion-container">`);

		Accordion($$renderer, {
			children: ($$renderer) => {
				Panel($$renderer, {
					get open() {
						return panel1Open;
					},

					set open($$value) {
						panel1Open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function icon($$renderer) {
								IconButton($$renderer, {
									toggle: true,
									pressed: panel1Open,
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											on: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->expand_less`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->expand_more`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}

							Header($$renderer, {
								icon,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Panel 1`);
								},
								$$slots: { icon: true, default: true }
							});
						}

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The content for panel 1.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Panel($$renderer, {
					get open() {
						return panel2Open;
					},

					set open($$value) {
						panel2Open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function icon($$renderer) {
								IconButton($$renderer, {
									toggle: true,
									pressed: panel2Open,
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											on: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->expand_less`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->expand_more`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}

							Header($$renderer, {
								icon,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Panel 2`);
								},
								$$slots: { icon: true, default: true }
							});
						}

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The content for panel 2.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Panel($$renderer, {
					get open() {
						return panel3Open;
					},

					set open($$value) {
						panel3Open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function description($$renderer) {
								$$renderer.push(`<!---->Description of panel 3.`);
							}

							function icon($$renderer) {
								IconButton($$renderer, {
									toggle: true,
									pressed: panel3Open,
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											on: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->expand_less`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->expand_more`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}

							Header($$renderer, {
								description,
								icon,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Panel 3`);
								},
								$$slots: { description: true, icon: true, default: true }
							});
						}

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The content for panel 3.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Panel($$renderer, {
					get open() {
						return panel4Open;
					},

					set open($$value) {
						panel4Open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function description($$renderer) {
								$$renderer.push(`<!---->Description of panel 4.`);
							}

							function icon($$renderer) {
								IconButton($$renderer, {
									toggle: true,
									pressed: panel4Open,
									children: ($$renderer) => {
										Icon($$renderer, {
											class: 'material-icons',
											on: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->expand_less`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Icon($$renderer, {
											class: 'material-icons',
											children: ($$renderer) => {
												$$renderer.push(`<!---->expand_more`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}

							Header($$renderer, {
								description,
								icon,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Panel 4`);
								},
								$$slots: { description: true, icon: true, default: true }
							});
						}

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The content for panel 4.`);
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

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}