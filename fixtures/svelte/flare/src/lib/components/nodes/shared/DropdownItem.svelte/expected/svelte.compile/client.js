import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import { getContext } from 'svelte';
import * as Command from '$lib/components/ui/command';
import Icon from '$lib/components/Icon.svelte';

var root = $.from_html(`<!> `, 1);

export default function DropdownItem($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: [
				'List.Dropdown.Item',
				'Grid.Dropdown.Item',
				'Form.Dropdown.Item'
			]
		}))),
		componentProps = $.derived(() => $.get($$d).props);

	const dropdownContext = getContext('unified-dropdown');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(componentProps).value ?? $.get(componentProps).title);

				let $1 = $.derived(() => [
					...$.get(componentProps).keywords ?? [],
					$.get(componentProps).title
				]);

				$.component(node_1, () => Command.Item, ($$anchor, Command_Item) => {
					Command_Item($$anchor, {
						get value() {
							return $.get($0);
						},

						get keywords() {
							return $.get($1);
						},

						onSelect: () => {
							dropdownContext.onSelect($.get(componentProps).value);
							$$props.onDispatch($$props.nodeId, 'onSelect', [$.get(componentProps).value]);
						},
						class: 'mx-2 h-9 px-2.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									Icon($$anchor, {
										get icon() {
											return $.get(componentProps).icon;
										},
										class: 'mr-2 size-[18px]'
									});
								};

								$.if(node_2, ($$render) => {
									if ($.get(componentProps).icon) $$render(consequent);
								});
							}

							var text = $.sibling(node_2);

							$.template_effect(() => $.set_text(text, ` ${$.get(componentProps).title ?? ''}`));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(componentProps) && dropdownContext) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}