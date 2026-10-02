import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { mdiArrowRight } from '@mdi/js';
import { Button, Card, Collapse } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let group = undefined;
	let controlledOpen = [false, true, false, false, false];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Separate (no bind:group)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Card($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(Array(5));

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let _ = each_array[i];

							Collapse($$renderer, {
								name: `Item ${$.stringify(i + 1)}`,
								children: ($$renderer) => {
									$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Accordian (with bind:group)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Card($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(Array(5));

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let _ = each_array_1[i];

							Collapse($$renderer, {
								name: `Item ${$.stringify(i + 1)}`,
								value: i,
								get group() {
									return group;
								},

								set group($$value) {
									group = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Controlled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Card($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_2 = $.ensure_array_like(Array(5));

						for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
							let _ = each_array_2[i];

							Collapse($$renderer, {
								name: `Item ${$.stringify(i + 1)}`,
								get open() {
									return controlledOpen[i];
								},

								set open($$value) {
									controlledOpen[i] = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <!--[-->`);

				const each_array_3 = $.ensure_array_like(Array(5));

				for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
					let _ = each_array_3[i];

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Toggle ${$.escape(i + 1)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--> <div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Expansion Panel</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Card($$renderer, {
					class: 'divide-y',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_4 = $.ensure_array_like(Array(5));

						for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
							let _ = each_array_4[i];

							Collapse($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-3 pb-3 border-t">Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);
								},

								$$slots: {
									default: true,
									trigger: ($$renderer) => {
										$$renderer.push(`<div slot="trigger" class="flex-1 px-3 py-3">Item ${$.escape(i + 1)}</div>`);
									}
								}
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Expansion Panel</h2> <h3>with popout</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_5 = $.ensure_array_like(Array(5));

				for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
					let _ = each_array_5[i];

					Collapse($$renderer, {
						popout: true,
						class: 'bg-surface-100 elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b',
						children: ($$renderer) => {
							$$renderer.push(`<div class="px-3 pb-3 bg-surface-200 border-t">Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
        omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
        Inventore laborum rerum at id?</div>`);
						},

						$$slots: {
							default: true,
							trigger: ($$renderer) => {
								$$renderer.push(`<div slot="trigger" class="flex-1 px-3 py-3">Item ${$.escape(i + 1)}</div>`);
							}
						}
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom transition</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Card($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_6 = $.ensure_array_like(Array(5));

						for (let i = 0, $$length = each_array_6.length; i < $$length; i++) {
							let _ = each_array_6[i];

							Collapse($$renderer, {
								name: `Item ${$.stringify(i + 1)}`,
								transition: fade,
								children: ($$renderer) => {
									$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Transition params</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Card($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_7 = $.ensure_array_like(Array(5));

						for (let i = 0, $$length = each_array_7.length; i < $$length; i++) {
							let _ = each_array_7[i];

							Collapse($$renderer, {
								name: `Item ${$.stringify(i + 1)}`,
								transitionParams: { duration: 2000 },
								children: ($$renderer) => {
									$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom icon and transition</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Card($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_8 = $.ensure_array_like(Array(5));

						for (let i = 0, $$length = each_array_8.length; i < $$length; i++) {
							let _ = each_array_8[i];

							Collapse($$renderer, {
								name: `Item ${$.stringify(i + 1)}`,
								icon: mdiArrowRight,
								classes: { icon: 'data-[open=true]:rotate-90' },
								children: ($$renderer) => {
									$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Flip icon transition</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Card($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_9 = $.ensure_array_like(Array(5));

						for (let i = 0, $$length = each_array_9.length; i < $$length; i++) {
							let _ = each_array_9[i];

							Collapse($$renderer, {
								name: `Item ${$.stringify(i + 1)}`,
								classes: {
									icon: 'data-[open=true]:rotate-0 data-[open=true]:-scale-y-100'
								},

								children: ($$renderer) => {
									$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
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