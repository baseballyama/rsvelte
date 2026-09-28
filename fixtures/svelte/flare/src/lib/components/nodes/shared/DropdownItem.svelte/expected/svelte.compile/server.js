import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import { getContext } from 'svelte';
import * as Command from '$lib/components/ui/command';
import Icon from '$lib/components/Icon.svelte';

export default function DropdownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({
				nodeId,
				uiTree,
				type: [
					'List.Dropdown.Item',
					'Grid.Dropdown.Item',
					'Form.Dropdown.Item'
				]
			}))),
			componentProps = $.derived(() => $$d().props);

		const dropdownContext = getContext('unified-dropdown');

		if (componentProps() && dropdownContext) {
			$$renderer.push('<!--[0-->');

			if (Command.Item) {
				$$renderer.push('<!--[-->');

				Command.Item($$renderer, {
					value: componentProps().value ?? componentProps().title,
					keywords: [...componentProps().keywords ?? [], componentProps().title],
					onSelect: () => {
						dropdownContext.onSelect(componentProps().value);
						onDispatch(nodeId, 'onSelect', [componentProps().value]);
					},
					class: 'mx-2 h-9 px-2.5',
					children: ($$renderer) => {
						if (componentProps().icon) {
							$$renderer.push('<!--[0-->');
							Icon($$renderer, { icon: componentProps().icon, class: 'mr-2 size-[18px]' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> ${$.escape(componentProps().title)}`);
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