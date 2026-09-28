import * as $ from 'svelte/internal/server';
import { BarStack, Button, Tooltip, TweenedValue } from 'svelte-ux';
import { format, randomInteger } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ label: 'Chrome', value: 65, classes: { bar: 'bg-warning' } },
			{ label: 'Safari', value: 18.55, classes: { bar: 'bg-info' } },
			{ label: 'Edge', value: 5.03, classes: { bar: 'bg-success' } },
			{ label: 'Firefox', value: 2.8, classes: { bar: 'bg-danger' } }
		];

		const dataWithColorProp = [
			{ label: 'Chrome', value: 65, color: 'yellow' },
			{ label: 'Safari', value: 18.55, color: 'blue' },
			{ label: 'Edge', value: 5.03, color: 'green' },
			{ label: 'Firefox', value: 2.8, color: 'red' }
		];

		function randomDataGen() {
			return data.map((d) => {
				return { ...d, value: randomInteger(3, 70) };
			});
		}

		let randomData = randomDataGen();
		let duration = 300;

		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				BarStack($$renderer, { data });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Larger gap</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				BarStack($$renderer, { data, class: 'gap-1' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Color via prop</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				BarStack($$renderer, { data: dataWithColorProp, class: 'gap-1' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Bar slot</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				BarStack($$renderer, {
					data,
					$$slots: {
						bar: ($$renderer, { item, total }) => {
							$$renderer.push(`<div slot="bar" class="flex items-center gap-2 truncate py-1 px-2 text-gray-900"><span class="text-sm font-semibold">${$.escape(format(item.value / total, 'percent'))}</span> <span class="text-xs truncate">(${$.escape(format(item.value, 'integer'))})</span></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Label using default slot</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				BarStack($$renderer, {
					data,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { item, total }) => {
							$$renderer.push(`<div${$.attr_class($.clsx(cls('h-1 group-first:rounded-l group-last:rounded-r', item.classes?.bar)))}></div> <div class="truncate text-xs font-semibold text-surface-content">${$.escape(item.label)}</div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Label with Tooltip</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				BarStack($$renderer, {
					data,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { item, total }) => {
							Tooltip($$renderer, {
								title: `${$.stringify(item.label)}: ${$.stringify(format(item.value / total, 'percent'))} (${$.stringify(format(item.value, 'integer'))})`,
								placement: 'bottom-start',
								offset: 2,
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cls('h-1 group-first:rounded-l group-last:rounded-r', item.classes?.bar)))}></div> <div class="truncate text-xs font-semibold text-surface-content">${$.escape(item.label)}</div>`);
								},
								$$slots: { default: true }
							});
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Tweened values</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					color: 'primary',
					class: 'mb-2',
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Randomize`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BarStack($$renderer, {
					data: randomData,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { item, total }) => {
							$$renderer.push(`<div${$.attr_class($.clsx(cls('group-first:rounded-l group-last:rounded-r', item.classes?.bar)))}><div class="flex items-center gap-1 truncate py-1 px-2"><span class="text-sm font-semibold text-gray-900">`);

							TweenedValue($$renderer, {
								value: item.value / total,
								options: { duration },
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { value }) => {
										$$renderer.push(`<!---->${$.escape(format(value ?? 0, 'percent'))}`);
									}
								}
							});

							$$renderer.push(`<!----></span> <span class="truncate text-xs text-gray-900">`);

							TweenedValue($$renderer, {
								value: item.value,
								options: { duration },
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { value }) => {
										$$renderer.push(`<!---->(${$.escape(format(value ?? 0, 'integer'))})`);
									}
								}
							});

							$$renderer.push(`<!----></span></div></div> <div class="truncate text-xs font-semibold text-surface-content">${$.escape(item.label)}</div>`);
						}
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}