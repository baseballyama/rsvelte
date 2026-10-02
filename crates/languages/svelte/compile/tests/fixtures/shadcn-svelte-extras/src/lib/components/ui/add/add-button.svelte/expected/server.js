import * as $ from 'svelte/internal/server';
import { useAddButton } from './add.svelte.js';
import { cn } from '$lib/utils';
import CheckIcon from '@lucide/svelte/icons/check';
import AddAgentLogo from './add-agent-logo.svelte';

export default function Add_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;
		const buttonState = useAddButton();

		$$renderer.push(`<button${$.attributes({
			type: 'button',
			class: $.clsx(cn('hover:bg-accent flex min-w-0 flex-1 items-center overflow-hidden rounded-l-md transition-colors md:pr-2 [&_svg]:size-3.5', className)),
			...rest,
			...buttonState.props
		})}><div class="flex size-9 shrink-0 items-center justify-center">`);

		CheckIcon($$renderer, {
			class: cn('absolute scale-0 transition-all ease-out', buttonState.root.clipboard.copied && 'scale-100')
		});

		$$renderer.push(`<!----> `);

		AddAgentLogo($$renderer, {
			agent: buttonState.root.agent,
			class: cn('absolute scale-100 transition-all ease-out', buttonState.root.clipboard.copied && 'scale-0')
		});

		$$renderer.push(`<!----></div> <span class="min-w-0 flex-1 truncate px-1 text-left font-mono text-xs select-text md:px-0"${$.attr('title', buttonState.root.addCommand)}>${$.escape(buttonState.root.addCommand)}</span></button>`);
	});
}