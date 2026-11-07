import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Pane, Slider, Point, List, Checkbox, Folder } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const defaults = {
			frequency: 1,
			axis: [0, 1, 0],
			forceDirectionEnabled: false,
			forceDirection: [1, 0, 0],
			timeEnabled: false,
			time: 0
		};

		const presets = {
			plant: {
				...defaults,
				speed: 2.5,
				factor: 0.3,
				noise: 0.4,
				pulse: 0.4,
				drift: 0.4,
				bendiness: 0.4,
				anchorEnabled: true,
				anchor: 0.76
			},
			orb: {
				...defaults,
				speed: 2.5,
				factor: 3,
				noise: 0.1,
				pulse: 0.1,
				drift: 0.1,
				bendiness: 0.5,
				anchorEnabled: false,
				anchor: 0
			},
			flowers: {
				...defaults,
				speed: 5,
				factor: 3,
				noise: 0.75,
				pulse: 0.75,
				drift: 0.75,
				bendiness: 1,
				anchorEnabled: true,
				anchor: 0
			}
		};

		let subject = 'plant';
		let options = presets.plant;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="svelte-2lw10l">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, $.spread_props([
						{ subject },
						options,
						{
							anchor: options.anchorEnabled ? options.anchor : undefined,
							forceDirection: options.forceDirectionEnabled ? options.forceDirection : undefined,
							time: options.timeEnabled ? options.time : undefined
						}
					]));
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Pane($$renderer, {
				title: 'Wobble',
				position: 'fixed',
				children: ($$renderer) => {
					List($$renderer, {
						label: 'subject',
						options: { Plant: 'plant', Orb: 'orb', Flowers: 'flowers' },
						get value() {
							return subject;
						},

						set value($$value) {
							subject = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'speed',
						min: 0,
						max: 5,
						step: 0.01,
						get value() {
							return options.speed;
						},

						set value($$value) {
							options.speed = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'factor',
						min: 0,
						max: 3,
						step: 0.01,
						get value() {
							return options.factor;
						},

						set value($$value) {
							options.factor = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'frequency',
						min: 0.1,
						max: 5,
						step: 0.01,
						get value() {
							return options.frequency;
						},

						set value($$value) {
							options.frequency = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'noise',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return options.noise;
						},

						set value($$value) {
							options.noise = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'pulse',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return options.pulse;
						},

						set value($$value) {
							options.pulse = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'drift',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return options.drift;
						},

						set value($$value) {
							options.drift = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'bendiness',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return options.bendiness;
						},

						set value($$value) {
							options.bendiness = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Point($$renderer, {
						label: 'axis',
						min: -1,
						max: 1,
						step: 0.01,
						get value() {
							return options.axis;
						},

						set value($$value) {
							options.axis = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'anchor',
						children: ($$renderer) => {
							Checkbox($$renderer, {
								label: 'enabled',
								get value() {
									return options.anchorEnabled;
								},

								set value($$value) {
									options.anchorEnabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'along axis',
								min: -2,
								max: 4,
								step: 0.01,
								disabled: !options.anchorEnabled,
								get value() {
									return options.anchor;
								},

								set value($$value) {
									options.anchor = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'forceDirection',
						children: ($$renderer) => {
							Checkbox($$renderer, {
								label: 'enabled',
								get value() {
									return options.forceDirectionEnabled;
								},

								set value($$value) {
									options.forceDirectionEnabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Point($$renderer, {
								label: 'xyz',
								min: -1,
								max: 1,
								step: 0.01,
								disabled: !options.forceDirectionEnabled,
								get value() {
									return options.forceDirection;
								},

								set value($$value) {
									options.forceDirection = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'time',
						children: ($$renderer) => {
							Checkbox($$renderer, {
								label: 'external',
								get value() {
									return options.timeEnabled;
								},

								set value($$value) {
									options.timeEnabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'seconds',
								min: 0,
								max: 30,
								step: 0.01,
								disabled: !options.timeEnabled,
								get value() {
									return options.time;
								},

								set value($$value) {
									options.time = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}