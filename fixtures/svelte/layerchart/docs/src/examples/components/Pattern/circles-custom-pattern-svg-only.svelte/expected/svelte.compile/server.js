import * as $ from 'svelte/internal/server';
import { Chart, Layer, Pattern } from 'layerchart';

export default function Circles_custom_pattern_svg_only($$renderer) {
	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function patternContent($$renderer) {
							$$renderer.push(`<circle${$.attr('cx', 2)}${$.attr('cy', 2)}${$.attr('r', 1)} class="fill-surface-content"></circle>`);
						}

						Pattern($$renderer, {
							id: 'circle-pattern-1',
							width: 4,
							height: 4,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					$$renderer.push(`<!---->`);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<circle${$.attr('cx', 4)}${$.attr('cy', 4)}${$.attr('r', 1)} class="fill-surface-content"></circle>`);
						}

						Pattern($$renderer, {
							id: 'circle-pattern-2',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					$$renderer.push(`<!---->`);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<circle${$.attr('cx', 4)}${$.attr('cy', 4)}${$.attr('r', 2)} class="fill-surface-content"></circle>`);
						}

						Pattern($$renderer, {
							id: 'circle-pattern-3',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					$$renderer.push(`<!---->`);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<circle${$.attr('cx', 4)}${$.attr('cy', 4)}${$.attr('r', 2)} class="fill-surface-content"></circle><circle${$.attr('cx', 0)}${$.attr('cy', 0)}${$.attr('r', 2)} class="fill-surface-content"></circle><circle${$.attr('cx', 0)}${$.attr('cy', 8)}${$.attr('r', 2)} class="fill-surface-content"></circle><circle${$.attr('cx', 8)}${$.attr('cy', 0)}${$.attr('r', 2)} class="fill-surface-content"></circle><circle${$.attr('cx', 8)}${$.attr('cy', 8)}${$.attr('r', 2)} class="fill-surface-content"></circle>`);
						}

						Pattern($$renderer, {
							id: 'circle-pattern-4',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					$$renderer.push(`<!---->`);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<circle${$.attr('cx', 4)}${$.attr('cy', 4)}${$.attr('r', 1)} class="fill-surface-content"></circle><circle${$.attr('cx', 0)}${$.attr('cy', 0)}${$.attr('r', 1)} class="fill-surface-content"></circle><circle${$.attr('cx', 0)}${$.attr('cy', 8)}${$.attr('r', 1)} class="fill-surface-content"></circle><circle${$.attr('cx', 8)}${$.attr('cy', 0)}${$.attr('r', 1)} class="fill-surface-content"></circle><circle${$.attr('cx', 8)}${$.attr('cy', 8)}${$.attr('r', 1)} class="fill-surface-content"></circle>`);
						}

						Pattern($$renderer, {
							id: 'circle-pattern-5',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					$$renderer.push(`<!---->`);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<circle${$.attr('cx', 4)}${$.attr('cy', 4)}${$.attr('r', 2)} class="fill-surface-content/30"></circle>`);
						}

						Pattern($$renderer, {
							id: 'circle-pattern-6',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					$$renderer.push(`<!----><!--[-->`);

					const each_array = $.ensure_array_like({ length: 6 });

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let _ = each_array[i];

						$$renderer.push(`<rect${$.attr('x', 0 + i * 120)}${$.attr('y', 0)}${$.attr('width', 100)}${$.attr('height', 300)}${$.attr('rx', 8)}${$.attr('fill', `url(#circle-pattern-${$.stringify(i + 1)})`)} class="stroke-surface-content"></rect>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}