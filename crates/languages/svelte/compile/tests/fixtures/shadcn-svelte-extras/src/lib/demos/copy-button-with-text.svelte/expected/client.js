import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from '$lib/components/ui/copy-button';
import TerminalIcon from '@lucide/svelte/icons/terminal';

var root = $.from_html(`<span class="font-mono text-sm font-light"></span>`);

export default function Copy_button_with_text($$anchor) {
	const command = 'jsrepo add ui/copy-button';

	{
		const icon = ($$anchor) => {
			TerminalIcon($$anchor, {});
		};

		CopyButton($$anchor, {
			text: command,
			size: 'sm',
			variant: 'outline',
			icon,
			children: ($$anchor, $$slotProps) => {
				var span = root();

				span.textContent = 'jsrepo add ui/copy-button';
				$.append($$anchor, span);
			},
			$$slots: { icon: true, default: true }
		});
	}
}