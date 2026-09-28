import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Element, Pane } from 'svelte-tweakpane-ui';
import Portal from '../../components/Portal.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { useStudio } from '../../internal/extensions.js';
import Tree from './Tree.svelte';
import { sceneHierarchyScope } from './types.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function SceneHierarchy($$anchor, $$props) {
	$.push($$props, true);

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

	let pane = $.state(void 0);

	$.user_effect(() => {
		if (!$.get(pane)) return;

		const contentEl = $.get(pane).element.querySelector('.tp-rotv_c');

		if (!contentEl) return;

		contentEl.style.maxHeight = '50vh';
		contentEl.style.overflow = 'auto';
		contentEl.style.minWidth = 'max-content';
		$.get(pane).element.style.overflow = 'auto';
	});

	var fragment = root();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		position: 'right',
		children: ($$anchor, $$slotProps) => {
			ToolbarButton($$anchor, {
				label: 'Scene Hierarchy',
				icon: 'mdiFormatListBulletedSquare',
				get onclick() {
					return ext.toggleEnabled;
				},

				get active() {
					return ext.state.enabled;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Pane($$anchor, {
						title: 'Scene Hierarchy',
						position: 'fixed',
						y: 72,
						x: 6,
						get tpPane() {
							return $.get(pane);
						},

						set tpPane($$value) {
							$.set(pane, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							Element($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Tree($$anchor, {});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if (ext.state.enabled) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}