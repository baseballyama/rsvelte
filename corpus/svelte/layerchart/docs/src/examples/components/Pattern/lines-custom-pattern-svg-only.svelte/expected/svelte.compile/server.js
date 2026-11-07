import * as $ from 'svelte/internal/server';
import { Chart, Layer, Pattern } from 'layerchart';

export default function Lines_custom_pattern_svg_only($$renderer) {
	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function patternContent($$renderer) {
							$$renderer.push(`<line x2="100%" class="stroke-surface-content"></line>`);
						}

						function children($$renderer, { pattern }) {
							$$renderer.push(`<rect${$.attr('x', 120 * 0)}${$.attr('y', 0)}${$.attr('width', 100)}${$.attr('height', 300)}${$.attr('rx', 8)}${$.attr('fill', pattern)} class="stroke-surface-content"></rect>`);
						}

						Pattern($$renderer, {
							width: 4,
							height: 4,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<line y2="100%" class="stroke-surface-content"></line>`);
						}

						function children($$renderer, { pattern }) {
							$$renderer.push(`<rect${$.attr('x', 120 * 1)}${$.attr('y', 0)}${$.attr('width', 100)}${$.attr('height', 300)}${$.attr('rx', 8)}${$.attr('fill', pattern)} class="stroke-surface-content"></rect>`);
						}

						Pattern($$renderer, {
							width: 4,
							height: 4,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<line x2="100%" class="stroke-surface-content"></line><line y2="100%" class="stroke-surface-content"></line>`);
						}

						function children($$renderer, { pattern }) {
							$$renderer.push(`<rect${$.attr('x', 120 * 2)}${$.attr('y', 0)}${$.attr('width', 100)}${$.attr('height', 300)}${$.attr('rx', 8)}${$.attr('fill', pattern)} class="stroke-surface-content"></rect>`);
						}

						Pattern($$renderer, {
							width: 4,
							height: 4,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<line${$.attr('x1', 8)}${$.attr('y2', 8)} class="stroke-surface-content"></line>`);
						}

						function children($$renderer, { pattern }) {
							$$renderer.push(`<rect${$.attr('x', 120 * 3)}${$.attr('y', 0)}${$.attr('width', 100)}${$.attr('height', 300)}${$.attr('rx', 8)}${$.attr('fill', pattern)} class="stroke-surface-content"></rect>`);
						}

						Pattern($$renderer, {
							width: 8,
							height: 8,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<line${$.attr('x2', 8)}${$.attr('y2', 8)} class="stroke-surface-content"></line>`);
						}

						function children($$renderer, { pattern }) {
							$$renderer.push(`<rect${$.attr('x', 120 * 4)}${$.attr('y', 0)}${$.attr('width', 100)}${$.attr('height', 300)}${$.attr('rx', 8)}${$.attr('fill', pattern)} class="stroke-surface-content"></rect>`);
						}

						Pattern($$renderer, {
							width: 8,
							height: 8,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function patternContent($$renderer) {
							$$renderer.push(`<line${$.attr('x1', 8)}${$.attr('y2', 8)} class="stroke-surface-content"></line><line${$.attr('x2', 8)}${$.attr('y2', 8)} class="stroke-surface-content"></line>`);
						}

						function children($$renderer, { pattern }) {
							$$renderer.push(`<rect${$.attr('x', 120 * 5)}${$.attr('y', 0)}${$.attr('width', 100)}${$.attr('height', 300)}${$.attr('rx', 8)}${$.attr('fill', pattern)} class="stroke-surface-content"></rect>`);
						}

						Pattern($$renderer, {
							width: 8,
							height: 8,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}