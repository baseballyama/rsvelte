import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NodeActionButton from './components/NodeActionButton.svelte';
import { addToPanel, globalValues } from './global.svelte.js';
import { globalInspectState } from './Panel.svelte';
import Wrapper from './Wrapper.svelte';

var root = $.from_html(`<div style="padding: 2px;"><!> <!></div>`);

export default function PanelValue($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, 'PanelValue'),
		renderIf = $.prop($$props, 'renderIf', 3, false);

	$.user_effect(() => {
		const remove = addToPanel($$props.key, () => $$props.value, label());

		return remove;
	});

	function setAsPanelValue() {
		globalValues.set($$props.key, {
			value: () => $$props.value,
			note: { title: 'Added manually' }
		});
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			Wrapper($$anchor, {
				class: ['borderless'],
				style: 'max-width: 2em; min-width: 2em;',
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node_1 = $.child(div);

					{
						var consequent = ($$anchor) => {
							NodeActionButton($$anchor, {
								title: 'Add to panel',
								onclick: setAsPanelValue,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('+');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						};

						var d = $.derived(() => !globalValues.has($$props.key) && globalInspectState.mounted.size);

						$.if(node_1, ($$render) => {
							if ($.get(d)) $$render(consequent);
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							NodeActionButton($$anchor, {
								title: 'Remove from panel',
								onclick: () => globalValues.delete($$props.key),
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('-');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						};

						var d_1 = $.derived(() => globalValues.has($$props.key));

						$.if(node_2, ($$render) => {
							if ($.get(d_1)) $$render(consequent_1);
						});
					}

					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		var d_2 = $.derived(() => Boolean(renderIf()));

		$.if(node, ($$render) => {
			if ($.get(d_2)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}