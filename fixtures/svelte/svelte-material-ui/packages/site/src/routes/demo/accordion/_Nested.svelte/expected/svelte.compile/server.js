import * as $ from 'svelte/internal/server';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';

export default function _Nested($$renderer) {
	$$renderer.push(`<div class="accordion-container">`);

	Accordion($$renderer, {
		children: ($$renderer) => {
			Panel($$renderer, {
				children: ($$renderer) => {
					Header($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Panel 1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						children: ($$renderer) => {
							Accordion($$renderer, {
								children: ($$renderer) => {
									Panel($$renderer, {
										color: 'secondary',
										children: ($$renderer) => {
											Header($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Panel 1.1`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Content($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->The content for panel 1.1.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Panel($$renderer, {
										color: 'secondary',
										children: ($$renderer) => {
											Header($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Panel 1.2`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Content($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->The content for panel 1.2.`);
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Panel($$renderer, {
				children: ($$renderer) => {
					Header($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Panel 2`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						children: ($$renderer) => {
							Accordion($$renderer, {
								children: ($$renderer) => {
									Panel($$renderer, {
										color: 'secondary',
										children: ($$renderer) => {
											Header($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Panel 2.1`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Content($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->The content for panel 2.1.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Panel($$renderer, {
										color: 'secondary',
										children: ($$renderer) => {
											Header($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Panel 2.2`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Content($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->The content for panel 2.2.`);
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