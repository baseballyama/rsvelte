import * as $ from 'svelte/internal/server';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import { useStudio } from '../../internal/extensions.js';
import { spaceScope } from './types.js';

export default function Space($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const { createExtension } = useStudio();

		const extension = createExtension({
			scope: spaceScope,
			state({ persist }) {
				return { space: persist('local') };
			},

			actions: {
				setSpace({ state }, space) {
					state.space = space;
				},

				toggleSpace({ state }) {
					state.space = state.space === 'local' ? 'world' : 'local';
				}
			},

			keyMap() {
				return { toggleSpace: 'w' };
			}
		});

		ToolbarItem($$renderer, {
			children: ($$renderer) => {
				HorizontalButtonGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							active: extension.state.space === 'local',
							icon: 'mdiAxisArrow',
							label: 'Local',
							tooltip: 'Local (W)',
							onclick: () => {
								extension.setSpace('local');
							}
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							active: extension.state.space === 'world',
							icon: 'mdiEarth',
							label: 'World',
							tooltip: 'World (W)',
							onclick: () => {
								extension.setSpace('world');
							}
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