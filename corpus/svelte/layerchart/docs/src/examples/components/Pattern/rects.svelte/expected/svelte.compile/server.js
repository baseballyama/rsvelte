import * as $ from 'svelte/internal/server';
import { Chart, Layer, Pattern, Rect } from 'layerchart';

export default function Rects($$renderer) {
	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { pattern }) {
							Rect($$renderer, {
								x: 120 * 0,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: pattern,
								stroke: 'var(--color-surface-content)'
							});
						}

						Pattern($$renderer, { size: 8, rects: true, children, $$slots: { default: true } });
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { pattern }) {
							Rect($$renderer, {
								x: 120 * 1,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: pattern,
								stroke: 'var(--color-surface-content)'
							});
						}

						Pattern($$renderer, {
							size: 12,
							rects: { inset: 1 },
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { pattern }) {
							Rect($$renderer, {
								x: 120 * 2,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: pattern,
								stroke: 'var(--color-surface-content)'
							});
						}

						Pattern($$renderer, {
							size: 14,
							rects: { inset: 2, rx: 2, ry: 2 },
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { pattern }) {
							Rect($$renderer, {
								x: 120 * 3,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: pattern,
								stroke: 'var(--color-surface-content)'
							});
						}

						Pattern($$renderer, {
							size: 14,
							rects: { inset: 2, rx: '100%', ry: '100%' },
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { pattern }) {
							Rect($$renderer, {
								x: 120 * 4,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: pattern,
								stroke: 'var(--color-surface-content)'
							});
						}

						Pattern($$renderer, {
							size: 14,
							rects: { inset: 2, rx: 2, color: 'var(--color-primary)', opacity: 0.6 },
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { pattern }) {
							Rect($$renderer, {
								x: 120 * 5,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: pattern,
								stroke: 'var(--color-surface-content)'
							});
						}

						Pattern($$renderer, {
							size: 14,
							background: 'var(--color-surface-200)',
							rects: { inset: 2, rx: 2, color: 'var(--color-info)' },
							children,
							$$slots: { default: true }
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