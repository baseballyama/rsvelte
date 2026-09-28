import * as $ from 'svelte/internal/server';
import { Chart, Layer, Pattern, Rect } from 'layerchart';

export default function Circles($$renderer) {
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

						Pattern($$renderer, { size: 4, circles: true, children, $$slots: { default: true } });
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

						Pattern($$renderer, { size: 8, circles: true, children, $$slots: { default: true } });
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
							size: 8,
							circles: { stagger: true },
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
							size: 8,
							circles: { radius: 2 },
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
							size: 8,
							circles: { radius: 2, stagger: true },
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
							size: 8,
							circles: { radius: 2, opacity: 0.3 },
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