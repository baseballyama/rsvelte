import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from 'svelte-tweakpane-ui';
import DropDownPane from '../../components/DropDownPane.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import { useStudio } from '../../internal/extensions.js';
import { snappingScope } from './types.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Snapping($$anchor, $$props) {
	$.push($$props, true);

	const { createExtension } = useStudio();

	const extension = createExtension({
		scope: snappingScope,
		state({ persist }) {
			return {
				enabled: persist(true),
				translate: persist(0.1),
				rotate: persist(15),
				scale: persist(0.1)
			};
		},

		actions: {
			toggleEnabled({ state }) {
				state.enabled = !state.enabled;
			},

			setEnabled({ state }, enabled) {
				state.enabled = enabled;
			},

			setRotate({ state }, rotate) {
				state.rotate = rotate;
			},

			setScale({ state }, scale) {
				state.scale = scale;
			},

			setTranslate({ state }, translate) {
				state.translate = translate;
			}
		},

		keyMap() {
			return { toggleEnabled: 'm' };
		}
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					ToolbarButton(node_1, {
						get active() {
							return extension.state.enabled;
						},
						icon: 'mdiMagnet',
						label: 'Snapping',
						tooltip: 'Snapping (M)',
						get onclick() {
							return extension.toggleEnabled;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					DropDownPane(node_2, {
						title: 'Snapping Settings',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							Slider(node_3, {
								label: 'Move',
								min: 0,
								get value() {
									return extension.state.translate;
								},

								$$events: {
									change: (e) => {
										extension.setTranslate(e.detail.value);
									}
								}
							});

							var node_4 = $.sibling(node_3, 2);

							Slider(node_4, {
								label: 'Rotate',
								min: 0,
								get value() {
									return extension.state.rotate;
								},
								format: (v) => `${v}°`,
								$$events: {
									change: (e) => {
										extension.setRotate(e.detail.value);
									}
								}
							});

							var node_5 = $.sibling(node_4, 2);

							Slider(node_5, {
								label: 'Scale',
								min: 0,
								get value() {
									return extension.state.scale;
								},

								$$events: {
									change: (e) => {
										extension.setScale(e.detail.value);
									}
								}
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

	$.snippet(node_6, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}