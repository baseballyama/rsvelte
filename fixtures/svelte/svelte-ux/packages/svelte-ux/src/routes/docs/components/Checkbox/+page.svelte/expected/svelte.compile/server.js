import * as $ from 'svelte/internal/server';
import { Button, Checkbox, SectionDivider } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let checked = true;
	let group = [2];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, {});
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { checked: true });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>bind:checked</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, {
					get checked() {
						return checked;
					},

					set checked($$value) {
						checked = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <div class="text-sm">set: `);

				Button($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->true`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>bind:group</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, {
					value: 1,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->One`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					value: 2,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Two`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					value: 3,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Three`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					value: 4,
					disabled: true,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Four (disabled)`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div>${$.escape(JSON.stringify(group))}</div> <div class="text-sm">`);

				Button($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->clear`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->select all`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Label</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
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
				Checkbox($$renderer, {
					fullWidth: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->One`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					fullWidth: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Two`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					fullWidth: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Three`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					fullWidth: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Four (disabled)`);
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

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let _ = each_array[$$index];

					Checkbox($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is a really long label`);
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

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let _ = each_array_1[$$index_1];

					Checkbox($$renderer, {
						classes: { root: 'truncate max-w-full', label: 'truncate' },
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is a really long label`);
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
				Checkbox($$renderer, { disabled: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { disabled: true, checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					disabled: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					disabled: true,
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Indeterminate</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, { indeterminate: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { indeterminate: true, checked: true });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Size</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div>`);
				Checkbox($$renderer, { size: 'xs' });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { size: 'xs', checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'xs',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'xs',
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Checkbox($$renderer, { size: 'sm' });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { size: 'sm', checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'sm',
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Checkbox($$renderer, { size: 'md' });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { size: 'md', checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'md',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'md',
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Checkbox($$renderer, { size: 'lg' });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { size: 'lg', checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'lg',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
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

		$$renderer.push(`<!----> `);

		SectionDivider($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Circle`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, { circle: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { circle: true, checked: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { circle: true });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Label</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, {
					circle: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->First`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					circle: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Second`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					circle: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Third`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, { circle: true, disabled: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { circle: true, disabled: true, checked: true });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Indeterminate</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, { circle: true, indeterminate: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { circle: true, indeterminate: true, checked: true });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Size</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div>`);
				Checkbox($$renderer, { size: 'xs', circle: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { size: 'xs', circle: true, checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'xs',
					circle: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'xs',
					circle: true,
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Checkbox($$renderer, { size: 'sm', circle: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { size: 'sm', circle: true, checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'sm',
					circle: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'sm',
					circle: true,
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Checkbox($$renderer, { size: 'md', circle: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { size: 'md', circle: true, checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'md',
					circle: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'md',
					circle: true,
					checked: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);
				Checkbox($$renderer, { size: 'lg', circle: true });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { size: 'lg', circle: true, checked: true });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'lg',
					circle: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					size: 'lg',
					circle: true,
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