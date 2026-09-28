import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import * as Command from '$lib/components/ui/command';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';

export default function DropdownSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch, selectedValue } = $$props;

		const $$d = $.derived(useTypedNode(() => ({
				nodeId,
				uiTree,
				type: [
					'List.Dropdown.Section',
					'Grid.Dropdown.Section',
					'Form.Dropdown.Section'
				]
			}))),
			node = $.derived(() => $$d().node),
			sectionProps = $.derived(() => $$d().props);

		if (node() && sectionProps()) {
			$$renderer.push('<!--[0-->');

			if (Command.Separator) {
				$$renderer.push('<!--[-->');
				Command.Separator($$renderer, { class: 'my-2' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Command.Group) {
				$$renderer.push('<!--[-->');

				Command.Group($$renderer, {
					heading: sectionProps().title,
					class: 'p-0',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(node().children);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let childId = each_array[$$index];

							NodeRenderer($$renderer, { nodeId: childId, uiTree, onDispatch, selectedValue });
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}