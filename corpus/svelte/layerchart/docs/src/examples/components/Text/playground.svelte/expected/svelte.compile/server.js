import * as $ from 'svelte/internal/server';
import { Chart, Layer, Text, Circle } from 'layerchart';
import TextPlaygroundControls from '$lib/components/controls/TextPlaygroundControls.svelte';
import { toTitleCase } from '@layerstack/utils';

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			x: 0,
			y: 0,
			value: 'This is really long text',
			width: 300,
			textAnchor: 'start',
			verticalAnchor: 'start',
			lineHeight: '1em',
			rotate: 0,
			scaleToFit: false,
			showAnchor: true,
			resizeSvg: true,
			truncate: false,
			truncateOptions: { maxChars: 22, minChars: 0, ellipsis: '…', position: 'end' }
		};

		const data = undefined;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TextPlaygroundControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid grid-cols-3"><!--[-->`);

			const each_array = $.ensure_array_like(['svg', 'canvas', 'html']);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let type = each_array[$$index];

				$$renderer.push(`<div><h2 class="text-center">${$.escape(toTitleCase(type))}</h2> <div class="flex items-center justify-center bg-surface-100 p-4"><div class="h-56 border border-surface-content/10"${$.attr_style('', {
					width: `${$.stringify(config.resizeSvg ? config.width : 300)}px`
				})}>`);

				Chart($$renderer, {
					height: 224,
					children: ($$renderer) => {
						Layer($$renderer, {
							type,
							children: ($$renderer) => {
								Text($$renderer, $.spread_props([
									config,
									{ truncate: config.truncate ? config.truncateOptions : false }
								]));

								$$renderer.push(`<!----> `);

								if (config.showAnchor) {
									$$renderer.push('<!--[0-->');
									Circle($$renderer, { cx: config.x, cy: config.y, r: 2, fill: 'red' });
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}