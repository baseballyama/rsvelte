import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Element, Pane, Separator } from 'svelte-tweakpane-ui';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { browser } from '../../internal/browser.js';
import { useStudio } from '../../internal/extensions.js';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import { useTransactions } from '../transactions/useTransactions.js';
import Bindings from './Bindings.svelte';
import { inspectorScope } from './types.js';

var root = $.from_html(`<div style="display: flex; justify-content: end; margin-bottom: 4px;"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Inspector($$anchor, $$props) {
	$.push($$props, true);

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

	let pane = $.state(void 0);

	$.user_effect(() => {
		if (!$.get(pane)) return;

		const contentEl = $.get(pane).element.querySelector('.tp-rotv_c');

		if (!contentEl) return;

		contentEl.style.maxHeight = '50vh';
		contentEl.style.overflow = 'auto';
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		position: 'right',
		children: ($$anchor, $$slotProps) => {
			ToolbarButton($$anchor, {
				label: 'Inspector',
				icon: 'mdiPencil',
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
		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => browser ? innerWidth - 6 - 320 : 6);

				Pane($$anchor, {
					get title() {
						return $.get(title);
					},
					position: 'fixed',
					width: 320,
					get x() {
						return $.get($0);
					},
					y: 6 + 60 + 6,
					get tpPane() {
						return $.get(pane);
					},

					set tpPane($$value) {
						$.set(pane, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_2 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								var fragment_4 = root_1();
								var node_3 = $.first_child(fragment_4);

								Element(node_3, {
									children: ($$anchor, $$slotProps) => {
										var div = root();
										var node_4 = $.child(div);

										{
											let $0 = $.derived(() => objectSelection.selectedObjects.length !== 1);

											ToolbarButton(node_4, {
												icon: 'mdiMenuOpen',
												label: 'Open In Editor',
												onclick: () => {
													openInEditor(objectSelection.selectedObjects[0]);
												},

												get disabled() {
													return $.get($0);
												},
												tooltip: 'Open In Editor'
											});
										}

										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_3, 2);

								Separator(node_5, {});
								$.append($$anchor, fragment_4);
							};

							$.if(node_2, ($$render) => {
								if (objectSelection.selectedObjects.length === 1) $$render(consequent);
							});
						}

						var node_6 = $.sibling(node_2, 2);

						Bindings(node_6, {});
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node_1, ($$render) => {
			if (ext.state.enabled && objectSelection.selectedObjects.length > 0) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_1, 2);

	$.snippet(node_7, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}