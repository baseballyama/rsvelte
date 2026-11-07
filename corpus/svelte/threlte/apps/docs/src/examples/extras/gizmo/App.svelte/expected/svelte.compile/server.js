import * as $ from 'svelte/internal/server';
import { Canvas, T } from '@threlte/core';
import { Gizmo, OrbitControls } from '@threlte/extras';
import { Folder, List, Pane, Slider, ThemeUtils } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let type = 'sphere';
		let speed = 1;
		let placement = 'bottom-left';
		let size = 86;
		let left = 10;
		let top = 10;
		let right = 10;
		let bottom = 10;
		let center = [0, 0, 0];
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				theme: ThemeUtils.presets.light,
				position: 'fixed',
				title: 'Gizmo',
				children: ($$renderer) => {
					List($$renderer, {
						label: 'type',
						options: { sphere: 'sphere', cube: 'cube' },
						get value() {
							return type;
						},

						set value($$value) {
							type = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'speed',
						min: 0.1,
						max: 1,
						get value() {
							return speed;
						},

						set value($$value) {
							speed = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					List($$renderer, {
						label: 'placement',
						options: [
							'top-left',
							'top-center',
							'top-right',
							'center-left',
							'center-center',
							'center-right',
							'bottom-left',
							'bottom-center',
							'bottom-right'
						],

						get value() {
							return placement;
						},

						set value($$value) {
							placement = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'size',
						min: 20,
						max: 350,
						step: 1,
						get value() {
							return size;
						},

						set value($$value) {
							size = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'offset',
						expanded: false,
						children: ($$renderer) => {
							Slider($$renderer, {
								label: 'top',
								min: 0,
								max: 50,
								step: 1,
								get value() {
									return top;
								},

								set value($$value) {
									top = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'left',
								min: 0,
								max: 50,
								step: 1,
								get value() {
									return left;
								},

								set value($$value) {
									left = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'right',
								min: 0,
								max: 50,
								step: 1,
								get value() {
									return right;
								},

								set value($$value) {
									right = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								label: 'bottom',
								min: 0,
								max: 50,
								step: 1,
								get value() {
									return bottom;
								},

								set value($$value) {
									bottom = $$value;
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

			$$renderer.push(`<!----> <div class="svelte-1ucsjry">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					if (T.PerspectiveCamera) {
						$$renderer.push('<!--[-->');

						T.PerspectiveCamera($$renderer, {
							makeDefault: true,
							position: [20, 20, 20],
							fov: 36,
							target: [0, 0, 0],
							children: ($$renderer) => {
								OrbitControls($$renderer, {
									onchange: (event) => {
										center = event.target.target.toArray();
									},

									children: ($$renderer) => {
										Gizmo($$renderer, {
											type,
											speed,
											placement,
											size,
											offset: { top, left, bottom, right }
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Scene($$renderer, { center });
					$$renderer.push(`<!---->`);
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