import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { useAddDropdownAgentOption } from '$lib/components/ui/add/add.svelte.js';
import { box } from 'svelte-toolbelt';
import { cn } from '$lib/utils';
import AddAgentLogo from './add-agent-logo.svelte';
import CheckIcon from '@lucide/svelte/icons/check';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'agent', 'class']);
var root = $.from_html(`<span class="flex items-center gap-2"><!> </span> <div class="size-4"><!></div>`, 1);

export default function Add_dropdown_agent_option($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const dropdownAgentOptionState = useAddDropdownAgentOption({ agent: box.with(() => $$props.agent) });
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('flex items-center justify-between [&_svg]:size-3.5', $$props.class));

		$.component(node, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
			DropdownMenu_Item($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => rest,
				() => dropdownAgentOptionState.props,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var span = $.first_child(fragment_1);
						var node_1 = $.child(span);

						AddAgentLogo(node_1, {
							get agent() {
								return dropdownAgentOptionState.opts.agent.current;
							}
						});

						var text = $.sibling(node_1);

						$.reset(span);

						var div = $.sibling(span, 2);
						var node_2 = $.child(div);

						{
							var consequent = ($$anchor) => {
								CheckIcon($$anchor, { class: 'size-4' });
							};

							$.if(node_2, ($$render) => {
								if (dropdownAgentOptionState.root.agent === $$props.agent) $$render(consequent);
							});
						}

						$.reset(div);
						$.template_effect(() => $.set_text(text, ` ${$$props.agent ?? ''}`));
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}