import * as $ from 'svelte/internal/server';
import * as easings from 'svelte/easing';
import { Button, ButtonGroup, Kbd, TweenedValue, getSettings } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { format } = getSettings();
		let value = 0;

		function onKeyDown(e) {
			const step = e.shiftKey ? 10 : e.altKey ? 100 : 1;

			switch (e.code) {
				case 'ArrowUp':
					increment(step);
					e.preventDefault();
					break;

				case 'ArrowDown':
					increment(-step);
					e.preventDefault();
					break;
			}
		}

		function increment(newValue) {
			value = (value ?? 0) + newValue;
		}

		$$renderer.push(`<h1>Examples</h1> <div class="grid grid-cols-[1fr,auto,auto] gap-2">`);

		ButtonGroup($$renderer, {
			variant: 'fill-light',
			class: 'grid grid-flow-col ml-2',
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->-100`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->-10`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->-1`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->0`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->+1`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->+10`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->+100`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'fill-light',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Random`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'fill-light',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Null`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="text-xs mt-1 ml-2 text-surface-content/50">Keyboard: `);

		Kbd($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->↑`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Kbd($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->↓`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> +/- 1. With `);

		Kbd($$renderer, {
			shift: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->shift`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> +/- 10. With `);

		Kbd($$renderer, {
			option: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->option`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->: +/- 100</div> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				TweenedValue($$renderer, { value });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Formatted</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				TweenedValue($$renderer, { value, format: 'decimal' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Options</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				TweenedValue($$renderer, {
					value,
					format: 'decimal',
					options: { duration: 1000, easing: easings.expoOut }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Style</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				TweenedValue($$renderer, {
					value,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { value }) => {
							$$renderer.push(`<span${$.attr_class($.clsx(cls('tabular-nums', (value ?? 0) < 0 ? 'text-danger' : 'text-success')))}>${$.escape($.store_get($$store_subs ??= {}, '$format', format)(value, 'decimal'))}</span>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				TweenedValue($$renderer, { value, disabled: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}