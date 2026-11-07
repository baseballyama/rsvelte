import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import { useStudio } from '../../internal/extensions.js';
import { spaceScope } from './types.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Space($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => extension.state.space === 'local');

						ToolbarButton(node_1, {
							get active() {
								return $.get($0);
							},
							icon: 'mdiAxisArrow',
							label: 'Local',
							tooltip: 'Local (W)',
							onclick: () => {
								extension.setSpace('local');
							}
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => extension.state.space === 'world');

						ToolbarButton(node_2, {
							get active() {
								return $.get($0);
							},
							icon: 'mdiEarth',
							label: 'World',
							tooltip: 'World (W)',
							onclick: () => {
								extension.setSpace('world');
							}
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	$.snippet(node_3, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}