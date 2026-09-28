import * as $ from 'svelte/internal/server';
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

export default function TransformControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
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

		if (enabled()) {
			$$renderer.push('<!--[0-->');

			if (objectSelection.selectedObjects.length > 1) {
				$$renderer.push(`<!--[0--><!---->`);

				{
					ContainerTransform($$renderer, {});
				}

				$$renderer.push(`<!---->`);
			} else if (objectSelection.selectedObjects.length === 1) {
				$$renderer.push(`<!--[1--><!---->`);

				{
					SingleTransform($$renderer, {});
				}

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		ToolbarItem($$renderer, {
			position: 'left',
			children: ($$renderer) => {
				HorizontalButtonGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							onclick: () => {
								extension.setMode('translate');
							},
							active: mode() === 'translate',
							label: 'Move',
							icon: 'mdiRayEndArrow',
							tooltip: 'Move (T)'
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							onclick: () => {
								extension.setMode('rotate');
							},
							active: mode() === 'rotate',
							label: 'Rotate',
							icon: 'mdiRotateLeft',
							tooltip: 'Rotate (R)'
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							onclick: () => {
								extension.setMode('scale');
							},
							active: mode() === 'scale',
							label: 'Scale',
							icon: 'mdiArrowExpand',
							tooltip: 'Scale (S)'
						});

						$$renderer.push(`<!----> `);

						DropDownPane($$renderer, {
							title: 'Settings',
							children: ($$renderer) => {
								Checkbox($$renderer, { value: enabled(), label: 'Enabled' });
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
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}