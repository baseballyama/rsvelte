import * as $ from 'svelte/internal/server';
import { CopyButton } from '$lib/components/ui/copy-button';
import TerminalIcon from '@lucide/svelte/icons/terminal';

export default function Copy_button_with_text($$renderer) {
	const command = 'jsrepo add ui/copy-button';

	{
		function icon($$renderer) {
			TerminalIcon($$renderer, {});
		}

		CopyButton($$renderer, {
			text: command,
			size: 'sm',
			variant: 'outline',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-mono text-sm font-light">jsrepo add ui/copy-button</span>`);
			},
			$$slots: { icon: true, default: true }
		});
	}
}