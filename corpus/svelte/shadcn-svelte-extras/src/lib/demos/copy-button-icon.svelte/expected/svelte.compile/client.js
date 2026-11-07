import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from '$lib/components/ui/copy-button';
import ClipboardIcon from '@lucide/svelte/icons/clipboard';

export default function Copy_button_icon($$anchor) {
	{
		const icon = ($$anchor) => {
			ClipboardIcon($$anchor, {});
		};

		CopyButton($$anchor, { text: 'Hello, World!', icon, $$slots: { icon: true } });
	}
}