import * as $ from 'svelte/internal/server';
import { Chart, Line, Layer } from 'layerchart';
import StartEndControls from '$lib/components/controls/MarkerControls2.svelte';

export default function Line_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pathGenerator = (x) => x;
		let pointCount = 10;
		let markerStart = true;
		let markerMid = false;
		let markerEnd = true;

		const data = $.derived(() => Array.from({ length: pointCount }).map((_, i) => {
			return { x: i + 1, y: pathGenerator(i / pointCount) ?? i };
		}));

		const markerTypes = [
			'arrow',
			'triangle',
			'dot',
			'circle',
			'circle-stroke',
			'line',
			'square',
			'square-stroke'
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			StartEndControls($$renderer, {
				get markerStart() {
					return markerStart;
				},

				set markerStart($$value) {
					markerStart = $$value;
					$$settled = false;
				},

				get markerEnd() {
					return markerEnd;
				},

				set markerEnd($$value) {
					markerEnd = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid gap-2"><!--[-->`);

			const each_array = $.ensure_array_like(markerTypes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let marker = each_array[$$index];

				$$renderer.push(`<div>${$.escape(marker)}</div> `);

				{
					function children($$renderer, { context }) {
						Layer($$renderer, {
							children: ($$renderer) => {
								Line($$renderer, {
									x1: 0,
									x2: context.width,
									y1: 0,
									y2: 0,
									class: 'stroke-primary',
									markerStart: markerStart ? marker : undefined,
									markerMid: markerMid ? marker : undefined,
									markerEnd: markerEnd ? marker : undefined
								});
							},
							$$slots: { default: true }
						});
					}

					Chart($$renderer, {
						data: data(),
						x: 'x',
						y: 'y',
						height: 35,
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!---->`);
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