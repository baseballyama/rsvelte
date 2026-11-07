import * as $ from 'svelte/internal/server';
import { Element, Pane } from 'svelte-tweakpane-ui';
import Portal from '../../components/Portal.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { useStudio } from '../../internal/extensions.js';
import Tree from './Tree.svelte';
import { sceneHierarchyScope } from './types.js';

export default function SceneHierarchy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const { createExtension } = useStudio();

		const ext = createExtension({
			scope: sceneHierarchyScope,
			state({ persist }) {
				return { enabled: persist(true) };
			},

			actions: {
				toggleEnabled({ state }) {
					state.enabled = !state.enabled;
				},

				setEnabled({ state }, enabled) {
					state.enabled = enabled;
				}
			},

			keyMap({ meta }) {
				return { toggleEnabled: meta('h') };
			}
		});

		let pane = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolbarItem($$renderer, {
				position: 'right',
				children: ($$renderer) => {
					ToolbarButton($$renderer, {
						label: 'Scene Hierarchy',
						icon: 'mdiFormatListBulletedSquare',
						onclick: ext.toggleEnabled,
						active: ext.state.enabled
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (ext.state.enabled) {
				$$renderer.push('<!--[0-->');

				Portal($$renderer, {
					children: ($$renderer) => {
						Pane($$renderer, {
							title: 'Scene Hierarchy',
							position: 'fixed',
							y: 72,
							x: 6,
							get tpPane() {
								return pane;
							},

							set tpPane($$value) {
								pane = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								Element($$renderer, {
									children: ($$renderer) => {
										Tree($$renderer, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
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