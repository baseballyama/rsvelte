import * as $ from 'svelte/internal/server';
import { Grid } from '@threlte/extras';
import { Color, RadioGrid, Slider } from 'svelte-tweakpane-ui';
import DropDownPane from '../../components/DropDownPane.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import { useStudio } from '../../internal/extensions.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { gridScope } from './types.js';

export default function Grid_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const { createExtension } = useStudio();
		const studioObjectsRegistry = useStudioObjectsRegistry();
		let grid = studioObjectsRegistry.studioObjectRef();

		const extension = createExtension({
			scope: gridScope,
			state({ persist }) {
				return {
					enabled: persist(true),
					color: persist('#5f5f5f'),
					step: persist(1),
					plane: persist('xz')
				};
			},

			actions: {
				setEnabled({ state }, enabled) {
					state.enabled = enabled;
				},

				toggleEnabled({ state }) {
					state.enabled = !state.enabled;
				},

				setColor({ state }, color) {
					state.color = color;
				},

				setStep({ state }, step) {
					state.step = step;
				},

				setPlane({ state }, plane) {
					state.plane = plane;
				}
			}
		});

		const onColorChange = (e) => {
			extension.setColor(e.detail.value);
		};

		const onPlaneChange = (e) => {
			extension.setPlane(e.detail.value);
		};

		const onStepChange = (e) => {
			extension.setStep(e.detail.value);
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolbarItem($$renderer, {
				position: 'left',
				children: ($$renderer) => {
					HorizontalButtonGroup($$renderer, {
						children: ($$renderer) => {
							ToolbarButton($$renderer, {
								onclick: () => {
									extension.toggleEnabled();
								},
								active: extension.state.enabled,
								label: 'Grid',
								icon: 'mdiGrid',
								tooltip: 'Grid'
							});

							$$renderer.push(`<!----> `);

							DropDownPane($$renderer, {
								title: 'Grid Settings',
								children: ($$renderer) => {
									Color($$renderer, { value: extension.state.color, label: 'Color' });
									$$renderer.push(`<!----> `);
									Slider($$renderer, { value: extension.state.step, label: 'Step', min: 0 });
									$$renderer.push(`<!----> `);

									RadioGrid($$renderer, {
										value: extension.state.plane,
										values: ['xy', 'xz', 'yz'],
										rows: 1,
										label: 'Plane'
									});

									$$renderer.push(`<!---->`);
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

			$$renderer.push(`<!----> `);

			if (extension.state.enabled) {
				$$renderer.push('<!--[0-->');

				Grid($$renderer, {
					name: 'Grid',
					userData: { ignoreOverrideMaterial: true },
					infiniteGrid: true,
					cellSize: extension.state.step,
					sectionSize: extension.state.step * 10,
					sectionColor: extension.state.color,
					cellColor: extension.state.color,
					plane: extension.state.plane,
					renderOrder: 9999,
					fadeDistance: extension.state.step * 500,
					get ref() {
						return grid.ref;
					},

					set ref($$value) {
						grid.ref = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			children?.($$renderer);
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