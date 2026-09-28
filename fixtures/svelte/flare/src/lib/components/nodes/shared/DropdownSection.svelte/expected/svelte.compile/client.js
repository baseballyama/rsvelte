import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import * as Command from '$lib/components/ui/command';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function DropdownSection($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: [
				'List.Dropdown.Section',
				'Grid.Dropdown.Section',
				'Form.Dropdown.Section'
			]
		}))),
		node = $.derived(() => $.get($$d).node),
		sectionProps = $.derived(() => $.get($$d).props);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => Command.Separator, ($$anchor, Command_Separator) => {
				Command_Separator($$anchor, { class: 'my-2' });
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => Command.Group, ($$anchor, Command_Group) => {
				Command_Group($$anchor, {
					get heading() {
						return $.get(sectionProps).title;
					},
					class: 'p-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						$.each(node_4, 16, () => $.get(node).children, (childId) => childId, ($$anchor, childId) => {
							NodeRenderer($$anchor, {
								get nodeId() {
									return childId;
								},

								get uiTree() {
									return $$props.uiTree;
								},

								get onDispatch() {
									return $$props.onDispatch;
								},

								get selectedValue() {
									return $$props.selectedValue;
								}
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(sectionProps)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}