import * as $ from 'svelte/internal/server';
import { Radio } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let group = undefined;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Controlled via checked prop</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, {});
				$$renderer.push(`<!----> `);
				Radio($$renderer, { checked: true });
				$$renderer.push(`<!----> `);
				Radio($$renderer, { checked: false });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Controlled via bind:group and value</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'group-value',
					value: 1,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'group-value',
					value: 2,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'group-value',
					value: 3,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Label</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'label',
					value: 1,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->First`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'label',
					value: 2,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Second`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'label',
					value: 3,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Third`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Full width</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'label',
					value: 1,
					fullWidth: true,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->First`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'label',
					value: 2,
					fullWidth: true,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Second`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'label',
					value: 3,
					fullWidth: true,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Third`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Long labels</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="border w-[150px] overflow-auto p-1"><!--[-->`);

				const each_array = $.ensure_array_like({ length: 5 });

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _ = each_array[i];

					Radio($$renderer, {
						name: 'long-label',
						value: i,
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->This is a really long label ${$.escape(i)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Long labels (truncate)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="border w-[150px] overflow-auto p-1"><!--[-->`);

				const each_array_1 = $.ensure_array_like({ length: 5 });

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let _ = each_array_1[i];

					Radio($$renderer, {
						name: 'long-label-truncate',
						value: i,
						classes: { root: 'truncate max-w-full', label: 'truncate' },
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->This is a really long label ${$.escape(i)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, { disabled: true });
				$$renderer.push(`<!----> `);
				Radio($$renderer, { disabled: true, checked: true });
				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					disabled: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Size</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div>`);
				Radio($$renderer, { name: 'xs', size: 'xs' });
				$$renderer.push(`<!----> `);
				Radio($$renderer, { name: 'xs', size: 'xs', checked: true });
				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'xs',
					size: 'xs',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'xs',
					size: 'xs',
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Radio($$renderer, { name: 'sm', size: 'sm' });
				$$renderer.push(`<!----> `);
				Radio($$renderer, { name: 'sm', size: 'sm', checked: true });
				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'sm',
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'sm',
					size: 'sm',
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Radio($$renderer, { name: 'md', size: 'md' });
				$$renderer.push(`<!----> `);
				Radio($$renderer, { name: 'md', size: 'md', checked: true });
				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'md',
					size: 'md',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'md',
					size: 'md',
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Radio($$renderer, { name: 'lg', size: 'lg' });
				$$renderer.push(`<!----> `);
				Radio($$renderer, { name: 'lg', size: 'lg', checked: true });
				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'lg',
					size: 'lg',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'lg',
					size: 'lg',
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
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