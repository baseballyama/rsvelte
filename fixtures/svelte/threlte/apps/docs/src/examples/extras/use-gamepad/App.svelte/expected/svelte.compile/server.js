import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Pane, Folder, Slider, ButtonGrid } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let gamepadRef = void 0;

		const buttonNames = [
			'clusterBottom',
			'clusterRight',
			'clusterLeft',
			'clusterTop',
			'leftBumper',
			'rightBumper',
			'select',
			'start',
			'leftStickButton',
			'rightStickButton',
			'directionalTop',
			'directionalBottom',
			'directionalLeft',
			'directionalRight',
			'center'
		];

		const stickNames = ['leftStick', 'rightStick'];

		const buttonLabels = $.derived(() => gamepadRef
			? buttonNames.map((name) => gamepadRef?.button(name).pressed ? `▶ ${name}` : name)
			: buttonNames.map((name) => name));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: '',
				position: 'fixed',
				children: ($$renderer) => {
					ButtonGrid($$renderer, { buttons: buttonLabels(), columns: 2, disabled: true });
					$$renderer.push(`<!----> `);

					if (gamepadRef) {
						$$renderer.push('<!--[0-->');

						Folder($$renderer, {
							title: 'Triggers',
							children: ($$renderer) => {
								Slider($$renderer, {
									value: gamepadRef.button('leftTrigger').value,
									label: 'LT',
									min: 0,
									max: 1,
									disabled: true
								});

								$$renderer.push(`<!----> `);

								Slider($$renderer, {
									value: gamepadRef.button('rightTrigger').value,
									label: 'RT',
									min: 0,
									max: 1,
									disabled: true
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Folder($$renderer, {
							title: 'Sticks',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(stickNames);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let name = each_array[$$index];

									Slider($$renderer, {
										value: gamepadRef.stick(name).x,
										label: `${$.stringify(name)}X`,
										min: -1,
										max: 1,
										disabled: true
									});

									$$renderer.push(`<!----> `);

									Slider($$renderer, {
										value: gamepadRef.stick(name).y,
										label: `${$.stringify(name)}Y`,
										min: -1,
										max: 1,
										disabled: true
									});

									$$renderer.push(`<!---->`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="svelte-h62pab">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, {
						get gamepadRef() {
							return gamepadRef;
						},

						set gamepadRef($$value) {
							gamepadRef = $$value;
							$$settled = false;
						}
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