import * as $ from 'svelte/internal/server';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { useAddDropdownAgentOption } from '$lib/components/ui/add/add.svelte.js';
import { box } from 'svelte-toolbelt';
import { cn } from '$lib/utils';
import AddAgentLogo from './add-agent-logo.svelte';
import CheckIcon from '@lucide/svelte/icons/check';

export default function Add_dropdown_agent_option($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { agent, class: className, $$slots, $$events, ...rest } = $$props;
		const dropdownAgentOptionState = useAddDropdownAgentOption({ agent: box.with(() => agent) });

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, $.spread_props([
				{
					class: cn('flex items-center justify-between [&_svg]:size-3.5', className)
				},
				rest,
				dropdownAgentOptionState.props,
				{
					children: ($$renderer) => {
						$$renderer.push(`<span class="flex items-center gap-2">`);
						AddAgentLogo($$renderer, { agent: dropdownAgentOptionState.opts.agent.current });
						$$renderer.push(`<!----> ${$.escape(agent)}</span> <div class="size-4">`);

						if (dropdownAgentOptionState.root.agent === agent) {
							$$renderer.push('<!--[0-->');
							CheckIcon($$renderer, { class: 'size-4' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}