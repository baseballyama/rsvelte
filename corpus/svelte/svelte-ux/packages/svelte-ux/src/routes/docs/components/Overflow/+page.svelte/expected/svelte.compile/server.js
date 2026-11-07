import * as $ from 'svelte/internal/server';
import { Button, Overflow, Tooltip } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let overflowItems = 1;
	const text = 'This is really long text used to demonstrate overflow.';

	$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->+ item`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->- item`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Overflow($$renderer, {
				class: 'w-1/2 h-[200px] overflow-hidden',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { overflowX, overflowY }) => {
						$$renderer.push(`<div>overflowX: ${$.escape(overflowX)}</div> <div>overflowY: ${$.escape(overflowY)}</div> <div class="whitespace-nowrap border rounded-lg bg-surface-100"><!--[-->`);

						const each_array = $.ensure_array_like({ length: overflowItems });

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let _ = each_array[$$index];

							$$renderer.push(`<div>Resize the window to see text truncate and watch values</div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Conditional tooltip</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Overflow($$renderer, {
				class: 'w-1/2 truncate border',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { overflowX }) => {
						Tooltip($$renderer, {
							title: text,
							enabled: overflowX > 0,
							children: ($$renderer) => {
								$$renderer.push(`<!---->This is really long text used to demonstrate overflow.`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}