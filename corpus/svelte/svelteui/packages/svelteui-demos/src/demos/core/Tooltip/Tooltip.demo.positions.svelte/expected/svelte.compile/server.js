import * as $ from 'svelte/internal/server';
import { Badge, Center, SimpleGrid, Tooltip } from '@svelteuidev/core';

export const type = 'demo';
export const configuration = {};

export default function Tooltip_demo_positions($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			SimpleGrid($$renderer, {
				cols: 3,
				children: ($$renderer) => {
					Tooltip($$renderer, {
						position: 'top',
						placement: 'start',
						label: 'top-start',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->top-start`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'top',
						placement: 'center',
						label: 'top-center',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->top-center`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'top',
						placement: 'end',
						label: 'top-end',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->top-end`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'right',
						placement: 'start',
						label: 'right-start',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->right-start`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'right',
						placement: 'center',
						label: 'right-center',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->right-center`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'right',
						placement: 'end',
						label: 'right-end',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->right-end`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'bottom',
						placement: 'start',
						label: 'bottom-start',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->bottom-start`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'bottom',
						placement: 'center',
						label: 'bottom-center',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->bottom-center`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'bottom',
						placement: 'end',
						label: 'bottom-end',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->bottom-end`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'left',
						placement: 'start',
						label: 'left-start',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->left-start`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'left',
						placement: 'center',
						label: 'left-center',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->left-center`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						position: 'left',
						placement: 'end',
						label: 'left-end',
						withArrow: true,
						children: ($$renderer) => {
							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->left-end`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}