import * as $ from 'svelte/internal/server';
import { ProgressCircle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let value = 50;
	let size = 40;
	let width = 4;
	let rotate = 0;
	let track = false;
	let indeterminate = true;
	let label = false;

	$$renderer.push(`<h1>Examples</h1> <h2>Demo</h2> <div class="border rounded bg-surface-100"><div class="grid grid-cols-[1fr,auto] items-center justify-items-center gap-4">`);

	ProgressCircle($$renderer, {
		value: indeterminate ? null : value,
		size,
		width,
		rotate,
		track,
		children: ($$renderer) => {
			if (label) {
				$$renderer.push(`<!--[0--><span class="text-surface-content/50 text-xs">`);

				if (indeterminate) {
					$$renderer.push(`<!--[0-->Loading...`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(value)}%`);
				}

				$$renderer.push(`<!--]--></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="bg-surface-content/5 border-l p-4"><label class="block">size: <input type="range"${$.attr('min', 0)}${$.attr('max', 120)}${$.attr('value', size)}/></label> <label class="block">width: <input type="range"${$.attr('min', 0)}${$.attr('max', 20)}${$.attr('value', width)}/></label> <label class="block">rotate: <input type="range"${$.attr('min', 0)}${$.attr('max', 360)}${$.attr('value', rotate)}/></label> <label class="block">value: <input type="range"${$.attr('min', 0)}${$.attr('max', 100)}${$.attr('value', value)}${$.attr('disabled', indeterminate, true)}/></label> <label class="block">indeterminate: <input type="checkbox"${$.attr('checked', indeterminate, true)}/></label> <label class="block">track: <input type="checkbox"${$.attr('checked', track, true)}/></label> <label class="block">label: <input type="checkbox"${$.attr('checked', label, true)}/></label></div></div></div> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ProgressCircle($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Value</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);
			ProgressCircle($$renderer, { value: 0 });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 20 });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 40 });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 60 });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 80 });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 100 });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Value w/ with track</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);
			ProgressCircle($$renderer, { value: 0, track: true });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 20, track: true });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 40, track: true });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 60, track: true });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 80, track: true });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { value: 100, track: true });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Value w/ with label</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);

			ProgressCircle($$renderer, {
				value: 0,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">0%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 20,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">20%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 40,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">40%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 60,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">60%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 80,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">80%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 100,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">100%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Value w/ with label and track</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);

			ProgressCircle($$renderer, {
				value: 0,
				track: true,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">0%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 20,
				track: true,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">20%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 40,
				track: true,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">40%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 60,
				track: true,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">60%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 80,
				track: true,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">80%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				value: 100,
				track: true,
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-surface-content/50 text-xs">100%</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Size</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);
			ProgressCircle($$renderer, { size: 20 });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, {});
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { size: 100 });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Width</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);
			ProgressCircle($$renderer, { width: 1 });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { width: 2 });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, {});
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { width: 10 });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Color</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);
			ProgressCircle($$renderer, { class: 'text-blue-500' });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { class: 'text-danger' });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { class: 'text-info' });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { class: 'text-success' });
			$$renderer.push(`<!----> `);
			ProgressCircle($$renderer, { class: 'text-orange-500' });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Track Color</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);

			ProgressCircle($$renderer, {
				class: 'text-blue-500 [--track-color:theme(colors.blue.500/10%)]',
				track: true
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				class: 'text-danger [--track-color:theme(colors.danger/10%)]',
				track: true
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				class: 'text-info [--track-color:theme(colors.info/10%)]',
				track: true
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				class: 'text-success [--track-color:theme(colors.success/10%)]',
				track: true
			});

			$$renderer.push(`<!----> `);

			ProgressCircle($$renderer, {
				class: 'text-warning [--track-color:theme(colors.warning/10%)]',
				track: true
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}