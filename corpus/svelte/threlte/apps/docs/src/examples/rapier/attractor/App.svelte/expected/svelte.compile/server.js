import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { World, Debug } from '@threlte/rapier';
import BasicScene from './BasicScene.svelte';
import AdvancedScene from './AdvancedScene.svelte';
import { Pane, Slider, TabGroup, TabPage, Checkbox, Button } from 'svelte-tweakpane-ui';

export default function App($$renderer) {
	const gravityTypes = ['static', 'linear', 'newtonian'];
	let scene = void 0;
	let showHelper = false;
	let gravityType = gravityTypes[0];
	let strengthLeft = 1;
	let strengthCenter = 1;
	let strengthRight = 1;
	let tabIndex = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: 'Attractor',
			position: 'fixed',
			children: ($$renderer) => {
				Button($$renderer, { title: 'Reset' });
				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Debug',
					get value() {
						return showHelper;
					},

					set value($$value) {
						showHelper = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				TabGroup($$renderer, {
					get selectedIndex() {
						return tabIndex;
					},

					set selectedIndex($$value) {
						tabIndex = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						TabPage($$renderer, {
							title: 'Basic',
							children: ($$renderer) => {
								Slider($$renderer, {
									label: 'Strength left',
									min: -5,
									max: 5,
									get value() {
										return strengthLeft;
									},

									set value($$value) {
										strengthLeft = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								Slider($$renderer, {
									label: 'Strength center',
									min: -5,
									max: 5,
									get value() {
										return strengthCenter;
									},

									set value($$value) {
										strengthCenter = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								Slider($$renderer, {
									label: 'Strength right',
									min: -5,
									max: 5,
									get value() {
										return strengthRight;
									},

									set value($$value) {
										strengthRight = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TabPage($$renderer, {
							title: 'Advanced',
							children: ($$renderer) => {
								Button($$renderer, { label: 'Set Gravity Type', title: 'static' });
								$$renderer.push(`<!----> `);
								Button($$renderer, { label: '', title: 'linear' });
								$$renderer.push(`<!----> `);
								Button($$renderer, { label: '', title: 'newtonian' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1gzrqsy">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				{
					function fallback($$renderer) {
						HTML($$renderer, {
							transform: true,
							children: ($$renderer) => {
								$$renderer.push(`<p class="svelte-1gzrqsy">It seems your browser<br/> doesn't support WASM.<br/> I'm sorry.</p>`);
							},
							$$slots: { default: true }
						});
					}

					World($$renderer, {
						gravity: [0, tabIndex == 1 ? 0 : -3, 0],
						fallback,
						children: ($$renderer) => {
							if (showHelper) {
								$$renderer.push('<!--[0-->');
								Debug($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (tabIndex == 1) {
								$$renderer.push('<!--[0-->');
								AdvancedScene($$renderer, { type: gravityType });
							} else {
								$$renderer.push('<!--[-1-->');
								BasicScene($$renderer, { strengthLeft, strengthCenter, strengthRight });
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { fallback: true, default: true }
					});
				}
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
}