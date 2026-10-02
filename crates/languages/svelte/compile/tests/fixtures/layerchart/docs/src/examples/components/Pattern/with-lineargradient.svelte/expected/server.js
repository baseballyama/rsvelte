import * as $ from 'svelte/internal/server';
import { Chart, Layer, LinearGradient, Pattern, Rect } from 'layerchart';

export default function With_lineargradient($$renderer) {
	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 0,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});

							$$renderer.push(`<!----> `);

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
									circles: { color: 'white', opacity: 0.5 },
									children,
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!---->`);
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
							Rect($$renderer, {
								x: 120 * 1,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});

							$$renderer.push(`<!----> `);

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
									size: 8,
									circles: { color: 'white', opacity: 0.5 },
									children,
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!---->`);
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
							Rect($$renderer, {
								x: 120 * 2,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});

							$$renderer.push(`<!----> `);

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
									size: 8,
									circles: { color: 'white', opacity: 0.5, stagger: true },
									children,
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!---->`);
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
							Rect($$renderer, {
								x: 120 * 3,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});

							$$renderer.push(`<!----> `);

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
									circles: { color: 'white', opacity: 0.5, stagger: true, radius: 2 },
									children,
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!---->`);
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
							Rect($$renderer, {
								x: 120 * 4,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});

							$$renderer.push(`<!----> `);

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
									size: 4,
									lines: { color: 'white', opacity: 0.5 },
									children,
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!---->`);
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
							Rect($$renderer, {
								x: 120 * 5,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});

							$$renderer.push(`<!----> `);

							{
								function children($$renderer, { pattern }) {
									Rect($$renderer, {
										x: 120 * 5,
										y: 0,
										width: 100,
										height: 300,
										rx: 8,
										fill: pattern
									});
								}

								Pattern($$renderer, {
									size: 4,
									lines: [
										{ color: 'black', opacity: 0.1 },
										{ color: 'black', opacity: 0.1, rotate: 90 }
									],
									children,
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!---->`);
						}

						LinearGradient($$renderer, {
							stops: ['hsl(195 100% 50%)', 'hsl(270 100% 30%)'],
							vertical: true,
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