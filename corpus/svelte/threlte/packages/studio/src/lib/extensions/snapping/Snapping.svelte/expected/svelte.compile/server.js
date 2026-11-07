import * as $ from 'svelte/internal/server';
import { Slider } from 'svelte-tweakpane-ui';
import DropDownPane from '../../components/DropDownPane.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import { useStudio } from '../../internal/extensions.js';
import { snappingScope } from './types.js';

export default function Snapping($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
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

		ToolbarItem($$renderer, {
			children: ($$renderer) => {
				HorizontalButtonGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							active: extension.state.enabled,
							icon: 'mdiMagnet',
							label: 'Snapping',
							tooltip: 'Snapping (M)',
							onclick: extension.toggleEnabled
						});

						$$renderer.push(`<!----> `);

						DropDownPane($$renderer, {
							title: 'Snapping Settings',
							children: ($$renderer) => {
								Slider($$renderer, { label: 'Move', min: 0, value: extension.state.translate });
								$$renderer.push(`<!----> `);

								Slider($$renderer, {
									label: 'Rotate',
									min: 0,
									value: extension.state.rotate,
									format: (v) => `${v}°`
								});

								$$renderer.push(`<!----> `);
								Slider($$renderer, { label: 'Scale', min: 0, value: extension.state.scale });
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
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}