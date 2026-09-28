import * as $ from 'svelte/internal/server';
import { CopyButton } from '$lib/components/ui/copy-button';
import ClipboardIcon from '@lucide/svelte/icons/clipboard';

export default function Copy_button_icon($$renderer) {
	{
		function icon($$renderer) {
			ClipboardIcon($$renderer, {});
		}

		CopyButton($$renderer, { text: 'Hello, World!', icon, $$slots: { icon: true } });
	}
}