import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from '@threlte/extras';
import { Color, RadioGrid, Slider } from 'svelte-tweakpane-ui';
import DropDownPane from '../../components/DropDownPane.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import { useStudio } from '../../internal/extensions.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { gridScope } from './types.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Grid_1($$anchor, $$props) {
	$.push($$props, true);

	const { createExtension } = useStudio();
	const studioObjectsRegistry = useStudioObjectsRegistry();
	let grid = $.proxy(studioObjectsRegistry.studioObjectRef());

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

	var fragment = root();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					ToolbarButton(node_1, {
						onclick: () => {
							extension.toggleEnabled();
						},

						get active() {
							return extension.state.enabled;
						},
						label: 'Grid',
						icon: 'mdiGrid',
						tooltip: 'Grid'
					});

					var node_2 = $.sibling(node_1, 2);

					DropDownPane(node_2, {
						title: 'Grid Settings',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							Color(node_3, {
								get value() {
									return extension.state.color;
								},
								label: 'Color',
								$$events: { change: onColorChange }
							});

							var node_4 = $.sibling(node_3, 2);

							Slider(node_4, {
								get value() {
									return extension.state.step;
								},
								label: 'Step',
								min: 0,
								$$events: { change: onStepChange }
							});

							var node_5 = $.sibling(node_4, 2);

							RadioGrid(node_5, {
								get value() {
									return extension.state.plane;
								},
								values: ['xy', 'xz', 'yz'],
								rows: 1,
								label: 'Plane',
								$$events: { change: onPlaneChange }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => extension.state.step * 10);
				let $1 = $.derived(() => extension.state.step * 500);

				Grid($$anchor, {
					name: 'Grid',
					userData: { ignoreOverrideMaterial: true },
					infiniteGrid: true,
					get cellSize() {
						return extension.state.step;
					},

					get sectionSize() {
						return $.get($0);
					},

					get sectionColor() {
						return extension.state.color;
					},

					get cellColor() {
						return extension.state.color;
					},

					get plane() {
						return extension.state.plane;
					},
					renderOrder: 9999,
					get fadeDistance() {
						return $.get($1);
					},

					get ref() {
						return grid.ref;
					},

					set ref($$value) {
						grid.ref = $$value;
					}
				});
			}
		};

		$.if(node_6, ($$render) => {
			if (extension.state.enabled) $$render(consequent);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	$.snippet(node_7, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}