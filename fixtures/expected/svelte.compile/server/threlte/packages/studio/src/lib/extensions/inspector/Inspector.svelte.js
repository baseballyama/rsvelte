import * as $ from 'svelte/internal/server';
import { Element, Pane, Separator } from 'svelte-tweakpane-ui';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { browser } from '../../internal/browser.js';
import { useStudio } from '../../internal/extensions.js';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import { useTransactions } from '../transactions/useTransactions.js';
import Bindings from './Bindings.svelte';
import { inspectorScope } from './types.js';

export default function Inspector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const { createExtension } = useStudio();
		const { openInEditor } = useTransactions();

		const ext = createExtension({
			scope: inspectorScope,
			state({ persist }) {
				return { enabled: persist(true) };
			},

			actions: {
				setEnabled({ state }, enabled) {
					state.enabled = enabled;
				},

				toggleEnabled({ state }) {
					state.enabled = !state.enabled;
				}
			},

			keyMap({ meta }) {
				return { toggleEnabled: meta('i') };
			}
		});

		const objectSelection = useObjectSelection();

		const title = $.derived(() => {
			if (objectSelection.selectedObjects.length === 0) return 'Inspector';
			if (objectSelection.selectedObjects.length === 1) return `${objectSelection.selectedObjects[0].name} (${objectSelection.selectedObjects[0].type})`;

			return `${objectSelection.selectedObjects.length} objects`;
		});

		let pane = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolbarItem($$renderer, {
				position: 'right',
				children: ($$renderer) => {
					ToolbarButton($$renderer, {
						label: 'Inspector',
						icon: 'mdiPencil',
						onclick: ext.toggleEnabled,
						active: ext.state.enabled
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (ext.state.enabled && objectSelection.selectedObjects.length > 0) {
				$$renderer.push('<!--[0-->');

				Pane($$renderer, {
					title: title(),
					position: 'fixed',
					width: 320,
					x: browser ? innerWidth - 6 - 320 : 6,
					y: 6 + 60 + 6,
					get tpPane() {
						return pane;
					},

					set tpPane($$value) {
						pane = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (objectSelection.selectedObjects.length === 1) {
							$$renderer.push('<!--[0-->');

							Element($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div style="display: flex; justify-content: end; margin-bottom: 4px;">`);

									ToolbarButton($$renderer, {
										icon: 'mdiMenuOpen',
										label: 'Open In Editor',
										onclick: () => {
											openInEditor(objectSelection.selectedObjects[0]);
										},
										disabled: objectSelection.selectedObjects.length !== 1,
										tooltip: 'Open In Editor'
									});

									$$renderer.push(`<!----></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							Separator($$renderer, {});
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						Bindings($$renderer, {});
						$$renderer.push(`<!---->`);
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