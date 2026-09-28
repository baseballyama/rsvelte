import * as $ from 'svelte/internal/server';
import { max } from 'd3-array';
import { mdiClose, mdiPlus } from '@mdi/js';
import { Icon, Tab, Tabs } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let options = [
			{ label: 'One', value: 1 },
			{ label: 'Two', value: 2 },
			{ label: 'Three', value: 3 },
			{ label: 'Four', value: 4 }
		];

		let value = 1;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1>Examples</h1> <h2>options</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					Tabs($$renderer, {
						options,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Tab components</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					Tabs($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like({ length: 5 });

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let _ = each_array[i];
								const v = i + 1;

								Tab($$renderer, {
									selected: value === v,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Tab ${$.escape(v)}`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},

						$$slots: {
							default: true,
							content: ($$renderer) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>placement</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-cols-2 gap-4">`);

					Tabs($$renderer, {
						options,
						placement: 'top',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});

					$$renderer.push(`<!----> `);

					Tabs($$renderer, {
						options,
						placement: 'bottom',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});

					$$renderer.push(`<!----> `);

					Tabs($$renderer, {
						options,
						placement: 'left',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});

					$$renderer.push(`<!----> `);

					Tabs($$renderer, {
						options,
						placement: 'right',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>rounded and contained</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-cols-2 gap-4">`);

					Tabs($$renderer, {
						options,
						placement: 'top',
						classes: {
							content: 'border px-4 py-2 rounded-b rounded-tr',
							tab: { root: 'rounded-t' }
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});

					$$renderer.push(`<!----> `);

					Tabs($$renderer, {
						options,
						placement: 'bottom',
						classes: {
							content: 'border px-4 py-2  rounded-t rounded-br',
							tab: { root: 'rounded-b' }
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});

					$$renderer.push(`<!----> `);

					Tabs($$renderer, {
						options,
						placement: 'left',
						classes: {
							content: 'border px-4 py-2  rounded-r',
							tab: { root: 'rounded-l' }
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});

					$$renderer.push(`<!----> `);

					Tabs($$renderer, {
						options,
						placement: 'right',
						classes: {
							content: 'border px-4 py-2 rounded-l',
							tab: { root: 'rounded-r' }
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						$$slots: {
							content: ($$renderer, { value }) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>add / remove</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					Tabs($$renderer, {
						options,
						value,
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(options);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let option = each_array_1[$$index_1];

								Tab($$renderer, {
									selected: value === option.value,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(option.label)} `);

										Icon($$renderer, {
											data: mdiClose,
											class: 'rounded-full p-0.5 hover:bg-surface-content/5'
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]--> `);

							Tab($$renderer, {
								children: ($$renderer) => {
									Icon($$renderer, {
										data: mdiPlus,
										class: 'rounded-full p-0.5 hover:bg-surface-content/5'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},

						$$slots: {
							default: true,
							content: ($$renderer) => {
								{
									$$renderer.push(`Page ${$.escape(value)}`);
								}
							}
						}
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
	});
}