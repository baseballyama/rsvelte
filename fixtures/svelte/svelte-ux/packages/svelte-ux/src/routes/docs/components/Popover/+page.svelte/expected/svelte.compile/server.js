import * as $ from 'svelte/internal/server';
import { Button, Popover, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Inferred anchor</h2> <h3>Uses the parent element of \`Popover\` if \`anchorEl\` not provided</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="inline-block">`);

				Popover($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div class="p-2 bg-surface-100 border shadow">Example contents</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Click me`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Placement</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="mx-20"><div class="grid grid-cols-5">`);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-2 text-right"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'top-start',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Top Start`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-3 text-center"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'top',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Top`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-4 text-left"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'top-end',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Top End`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-1 text-right"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'left-start',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Left Start`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-5 text-left"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'right-start',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right Start`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-1 text-right"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'left',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Left`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-5 text-left"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'right',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-1 text-right"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'left-end',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Left End`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-5 text-left"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'right-end',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right End`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-2 text-right"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'bottom-start',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Bottom Start`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-3 text-center"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'bottom',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Bottom`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							$$renderer.push(`<div class="col-start-4 text-left"><div class="inline-block">`);

							Popover($$renderer, {
								open,
								placement: 'bottom-start',
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Bottom End`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});

				$$renderer.push(`<!----></div></div>`);
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