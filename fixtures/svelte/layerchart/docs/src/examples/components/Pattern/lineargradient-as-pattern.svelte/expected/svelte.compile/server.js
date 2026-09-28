import * as $ from 'svelte/internal/server';
import { Chart, Layer, LinearGradient, Pattern, Rect } from 'layerchart';

export default function Lineargradient_as_pattern($$renderer) {
	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { gradient }) {
							{
								function children($$renderer, { pattern }) {
									Rect($$renderer, {
										x: 120 * 0,
										y: 0,
										width: 100,
										height: 300,
										rx: 8,
										fill: pattern
									});
								}

								Pattern($$renderer, {
									size: 4,
									background: gradient,
									children,
									$$slots: { default: true }
								});
							}
						}

						LinearGradient($$renderer, {
							stops: ['hsl(60 100% 50%)', 'hsl(30 100% 40%)'],
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							{
								function children($$renderer, { pattern }) {
									Rect($$renderer, {
										x: 120 * 1,
										y: 0,
										width: 100,
										height: 300,
										rx: 8,
										fill: pattern
									});
								}

								Pattern($$renderer, {
									size: 4,
									background: gradient,
									children,
									$$slots: { default: true }
								});
							}
						}

						LinearGradient($$renderer, {
							stops: ['hsl(60 100% 50%)', 'hsl(140 100% 40%)'],
							rotate: 45,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							{
								function children($$renderer, { pattern }) {
									Rect($$renderer, {
										x: 120 * 2,
										y: 0,
										width: 100,
										height: 300,
										rx: 8,
										fill: pattern
									});
								}

								Pattern($$renderer, {
									size: 4,
									background: gradient,
									children,
									$$slots: { default: true }
								});
							}
						}

						LinearGradient($$renderer, {
							stops: ['hsl(195 100% 50%)', 'hsl(270 100% 30%)'],
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							{
								function children($$renderer, { pattern }) {
									Rect($$renderer, {
										x: 120 * 3,
										y: 0,
										width: 100,
										height: 300,
										rx: 8,
										fill: pattern
									});
								}

								Pattern($$renderer, {
									size: 8,
									background: gradient,
									children,
									$$slots: { default: true }
								});
							}
						}

						LinearGradient($$renderer, {
							stops: ['hsl(60 100% 50%)', 'hsl(30 100% 40%)'],
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							{
								function children($$renderer, { pattern }) {
									Rect($$renderer, {
										x: 120 * 4,
										y: 0,
										width: 100,
										height: 300,
										rx: 8,
										fill: pattern
									});
								}

								Pattern($$renderer, {
									size: 8,
									background: gradient,
									children,
									$$slots: { default: true }
								});
							}
						}

						LinearGradient($$renderer, {
							stops: ['hsl(60 100% 50%)', 'hsl(140 100% 40%)'],
							rotate: 45,
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