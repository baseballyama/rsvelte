import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Pane, Slider, Checkbox, Button, Folder, List, Point } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const presets = {
			'Third Person': {
				smoothTime: 0.2,
				distance: 6,
				minPolarAngle: 0.3,
				maxPolarAngle: 1.5,
				polarAngle: 1.1,
				azimuthLocked: false,
				azimuthAngle: 0,
				pointerLock: true,
				lookAtOffset: [0, 1, 0],
				deadZone: [0, 0],
				lookAhead: 0,
				followSmoothTime: 0.15,
				trackRotation: false,
				trackRotationSmoothTime: 0,
				trackRotationOffset: 0
			},
			Fixed: {
				smoothTime: 0.2,
				distance: 5,
				minPolarAngle: 0.4,
				maxPolarAngle: 1.4,
				polarAngle: 1.1,
				azimuthLocked: false,
				azimuthAngle: 0,
				pointerLock: false,
				lookAtOffset: [0, 1, 0],
				deadZone: [0, 0],
				lookAhead: 0,
				followSmoothTime: 0,
				trackRotation: true,
				trackRotationSmoothTime: 0.25,
				trackRotationOffset: Math.PI
			},
			'Top-Down': {
				smoothTime: 0.2,
				distance: 11,
				minPolarAngle: 0.6,
				maxPolarAngle: 0.6,
				polarAngle: 0.6,
				azimuthLocked: true,
				azimuthAngle: 0,
				pointerLock: false,
				lookAtOffset: [0, 0, 0],
				deadZone: [0, 0],
				lookAhead: 0,
				followSmoothTime: 0,
				trackRotation: false,
				trackRotationSmoothTime: 0,
				trackRotationOffset: 0
			},
			Sidescroller: {
				smoothTime: 0.25,
				distance: 7,
				minPolarAngle: Math.PI / 2,
				maxPolarAngle: Math.PI / 2,
				polarAngle: Math.PI / 2,
				azimuthLocked: true,
				azimuthAngle: 0,
				pointerLock: false,
				lookAtOffset: [0, 1, 0],
				deadZone: [1.5, 0.5],
				lookAhead: 0,
				followSmoothTime: 0.1,
				trackRotation: false,
				trackRotationSmoothTime: 0,
				trackRotationOffset: 0
			},
			Racing: {
				smoothTime: 0.08,
				distance: 6,
				minPolarAngle: 1,
				maxPolarAngle: 1,
				polarAngle: 1,
				azimuthLocked: true,
				azimuthAngle: 0,
				pointerLock: false,
				lookAtOffset: [0, 0.8, 0],
				deadZone: [0, 0],
				lookAhead: 0.4,
				followSmoothTime: 0.05,
				trackRotation: false,
				trackRotationSmoothTime: 0,
				trackRotationOffset: 0
			},
			Cinematic: {
				smoothTime: 0.6,
				distance: 14,
				minPolarAngle: 0.8,
				maxPolarAngle: 0.8,
				polarAngle: 0.8,
				azimuthLocked: true,
				azimuthAngle: 0,
				pointerLock: false,
				lookAtOffset: [0, 1.2, 0],
				deadZone: [0, 0],
				lookAhead: 0,
				followSmoothTime: 0.5,
				trackRotation: false,
				trackRotationSmoothTime: 0,
				trackRotationOffset: 0
			}
		};

		const presetOptions = Object.fromEntries(Object.keys(presets).map((k) => [k, k]));
		let preset = 'Third Person';
		let smoothTime = 0.2;
		let distance = 6;
		let minPolarAngle = 0.3;
		let maxPolarAngle = 1.5;
		let polarAngle = 1.1;
		let azimuthLocked = false;
		let azimuthAngle = 0;
		let pointerLock = true;
		let lookAtOffset = [0, 1, 0];
		let deadZone = [0, 0];
		let lookAhead = 0;
		let followSmoothTime = 0.15;
		let trackRotation = false;
		let trackRotationSmoothTime = 0;
		let trackRotationOffset = 0;
		let collision = true;
		let following = true;

		const apply = (preset) => {
			smoothTime = preset.smoothTime;
			distance = preset.distance;
			minPolarAngle = preset.minPolarAngle;
			maxPolarAngle = preset.maxPolarAngle;
			polarAngle = preset.polarAngle;
			azimuthLocked = preset.azimuthLocked;
			azimuthAngle = preset.azimuthAngle;
			pointerLock = preset.pointerLock;
			lookAtOffset = preset.lookAtOffset;
			deadZone = preset.deadZone;
			lookAhead = preset.lookAhead;
			followSmoothTime = preset.followSmoothTime;
			trackRotation = preset.trackRotation;
			trackRotationSmoothTime = preset.trackRotationSmoothTime;
			trackRotationOffset = preset.trackRotationOffset;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: '',
				position: 'fixed',
				children: ($$renderer) => {
					List($$renderer, {
						label: 'preset',
						options: presetOptions,
						get value() {
							return preset;
						},

						set value($$value) {
							preset = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'CameraControls',
						children: ($$renderer) => {
							Slider($$renderer, {
								label: 'smoothTime',
								min: 0,
								max: 1,
								step: 0.01,
								get value() {
									return smoothTime;
								},

								set value($$value) {
									smoothTime = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'distance',
								min: 1,
								max: 20,
								step: 0.1,
								get value() {
									return distance;
								},

								set value($$value) {
									distance = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'minPolarAngle',
								min: 0,
								max: Math.PI,
								step: 0.01,
								get value() {
									return minPolarAngle;
								},

								set value($$value) {
									minPolarAngle = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'maxPolarAngle',
								min: 0,
								max: Math.PI,
								step: 0.01,
								get value() {
									return maxPolarAngle;
								},

								set value($$value) {
									maxPolarAngle = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Checkbox($$renderer, {
								label: 'azimuthLocked',
								get value() {
									return azimuthLocked;
								},

								set value($$value) {
									azimuthLocked = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Checkbox($$renderer, {
								label: 'pointerLock',
								get value() {
									return pointerLock;
								},

								set value($$value) {
									pointerLock = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Checkbox($$renderer, {
								label: 'collision',
								get value() {
									return collision;
								},

								set value($$value) {
									collision = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'useFollow',
						children: ($$renderer) => {
							Point($$renderer, {
								label: 'lookAtOffset',
								min: -3,
								max: 3,
								step: 0.05,
								get value() {
									return lookAtOffset;
								},

								set value($$value) {
									lookAtOffset = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Point($$renderer, {
								label: 'deadZone',
								min: 0,
								max: 3,
								step: 0.05,
								get value() {
									return deadZone;
								},

								set value($$value) {
									deadZone = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'lookAhead',
								min: 0,
								max: 1,
								step: 0.01,
								get value() {
									return lookAhead;
								},

								set value($$value) {
									lookAhead = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'followSmoothTime',
								min: 0,
								max: 1,
								step: 0.01,
								get value() {
									return followSmoothTime;
								},

								set value($$value) {
									followSmoothTime = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Checkbox($$renderer, {
								label: 'trackRotation',
								get value() {
									return trackRotation;
								},

								set value($$value) {
									trackRotation = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'trackRotationSmoothTime',
								min: 0,
								max: 1,
								step: 0.01,
								get value() {
									return trackRotationSmoothTime;
								},

								set value($$value) {
									trackRotationSmoothTime = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'trackRotationOffset',
								min: -Math.PI,
								max: Math.PI,
								step: 0.01,
								get value() {
									return trackRotationOffset;
								},

								set value($$value) {
									trackRotationOffset = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Checkbox($$renderer, {
								label: 'following',
								get value() {
									return following;
								},

								set value($$value) {
									following = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'Reset preset' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="svelte-9srtwf">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, {
						smoothTime,
						distance,
						minPolarAngle,
						maxPolarAngle,
						polarAngle,
						azimuthLocked,
						azimuthAngle,
						pointerLock,
						lookAtOffset,
						deadZone,
						lookAhead,
						followSmoothTime,
						trackRotation,
						trackRotationSmoothTime,
						trackRotationOffset,
						collision,
						following
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}