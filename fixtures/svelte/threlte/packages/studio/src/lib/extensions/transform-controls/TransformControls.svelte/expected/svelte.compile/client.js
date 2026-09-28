import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from 'svelte-tweakpane-ui';
import DropDownPane from '../../components/DropDownPane.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import { useStudio } from '../../internal/extensions.js';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import ContainerTransform from './ContainerTransform.svelte';
import SingleTransform from './SingleTransform.svelte';
import { transformControlsScope } from './types.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function TransformControls($$anchor, $$props) {
	$.push($$props, true);

	const { createExtension } = useStudio();

	const extension = createExtension({
		scope: transformControlsScope,
		state: ({ persist }) => ({
			enabled: persist(true),
			mode: persist('translate'),
			inUse: false
		}),

		actions: {
			enable({ state }) {
				state.enabled = true;
			},

			disable({ state }) {
				state.enabled = false;
				state.inUse = false;
			},

			toggle({ state }) {
				state.enabled = !state.enabled;

				if (!state.enabled) {
					state.inUse = false;
				}
			},

			setMode({ state }, mode) {
				state.mode = mode;
			},

			translate({ state }) {
				state.mode = 'translate';
			},

			rotate({ state }) {
				state.mode = 'rotate';
			},

			scale({ state }) {
				state.mode = 'scale';
			},

			setInUse({ state }, inUse) {
				state.inUse = inUse;
			}
		},

		keyMap() {
			return { translate: 't', rotate: 'r', scale: 's', toggleInUse: 'z' };
		}
	});

	const mode = $.derived(() => extension.state.mode);
	const enabled = $.derived(() => extension.state.enabled);
	const objectSelection = useObjectSelection();
	const key = (objects) => objects.map((o) => o.uuid).join();
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.key(node_2, () => key(objectSelection.selectedObjects), ($$anchor) => {
						ContainerTransform($$anchor, {});
					});

					$.append($$anchor, fragment_2);
				};

				var consequent_1 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_3 = $.first_child(fragment_4);

					$.key(node_3, () => key(objectSelection.selectedObjects), ($$anchor) => {
						SingleTransform($$anchor, {});
					});

					$.append($$anchor, fragment_4);
				};

				$.if(node_1, ($$render) => {
					if (objectSelection.selectedObjects.length > 1) $$render(consequent); else if (objectSelection.selectedObjects.length === 1) $$render(consequent_1, 1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(enabled)) $$render(consequent_2);
		});
	}

	var node_4 = $.sibling(node, 2);

	ToolbarItem(node_4, {
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root();
					var node_5 = $.first_child(fragment_7);

					{
						let $0 = $.derived(() => $.get(mode) === 'translate');

						ToolbarButton(node_5, {
							onclick: () => {
								extension.setMode('translate');
							},

							get active() {
								return $.get($0);
							},
							label: 'Move',
							icon: 'mdiRayEndArrow',
							tooltip: 'Move (T)'
						});
					}

					var node_6 = $.sibling(node_5, 2);

					{
						let $0 = $.derived(() => $.get(mode) === 'rotate');

						ToolbarButton(node_6, {
							onclick: () => {
								extension.setMode('rotate');
							},

							get active() {
								return $.get($0);
							},
							label: 'Rotate',
							icon: 'mdiRotateLeft',
							tooltip: 'Rotate (R)'
						});
					}

					var node_7 = $.sibling(node_6, 2);

					{
						let $0 = $.derived(() => $.get(mode) === 'scale');

						ToolbarButton(node_7, {
							onclick: () => {
								extension.setMode('scale');
							},

							get active() {
								return $.get($0);
							},
							label: 'Scale',
							icon: 'mdiArrowExpand',
							tooltip: 'Scale (S)'
						});
					}

					var node_8 = $.sibling(node_7, 2);

					DropDownPane(node_8, {
						title: 'Settings',
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								get value() {
									return $.get(enabled);
								},
								label: 'Enabled',
								$$events: {
									change: (e) => {
										if (e.detail.value) {
											extension.enable();
										} else {
											extension.disable();
										}
									}
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_4, 2);

	$.snippet(node_9, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}