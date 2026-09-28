import * as $ from 'svelte/internal/server';
import Heading from "carbon-components-svelte/Heading/Heading.svelte";
import Section from "carbon-components-svelte/Heading/Section.svelte";

export default function Heading_test($$renderer) {
	Section($$renderer, {
		children: ($$renderer) => {
			Heading($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default Heading 1`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Section($$renderer, {
		children: ($$renderer) => {
			Heading($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Nested Heading 1`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Section($$renderer, {
				children: ($$renderer) => {
					Heading($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Nested Heading 2`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Section($$renderer, {
						children: ($$renderer) => {
							Heading($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Nested Heading 3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Section($$renderer, {
								children: ($$renderer) => {
									Heading($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Nested Heading 4`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Section($$renderer, {
										children: ($$renderer) => {
											Heading($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Nested Heading 5`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Section($$renderer, {
												children: ($$renderer) => {
													Heading($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Nested Heading 6`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Section($$renderer, {
														children: ($$renderer) => {
															Heading($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Nested Capped at Heading 6`);
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

							$$renderer.push(`<!---->`);
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
					Heading($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sibling Heading 2`);
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
		level: 5,
		children: ($$renderer) => {
			Heading($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Custom Level Heading 5`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Section($$renderer, {
				children: ($$renderer) => {
					Heading($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Custom Level Heading 6`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Section($$renderer, {
						children: ($$renderer) => {
							Heading($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Custom Level Capped at Heading 6`);
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

	$$renderer.push(`<!----> <div data-testid="custom-tag-wrapper">`);

	Section($$renderer, {
		tag: 'div',
		children: ($$renderer) => {
			Heading($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Custom Tag Heading 1`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Heading($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading without Section`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}