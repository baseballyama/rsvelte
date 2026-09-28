import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { toast } from 'svelte-sonner';

export default function Notification_21($$anchor, $$props) {
	$.push($$props, true);

	Button($$anchor, {
		variant: 'outline',
		onclick: () => {
			toast('Your request was completed!', {
				action: { label: 'Undo', onClick: () => console.info('Undo') },
				description: 'It was a long journey, but we made it!'
			});
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show sonner');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.pop();
}