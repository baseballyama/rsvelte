import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { toast } from 'svelte-sonner';

export default function Notification_21($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Button($$renderer, {
			variant: 'outline',
			onclick: () => {
				toast('Your request was completed!', {
					action: { label: 'Undo', onClick: () => console.info('Undo') },
					description: 'It was a long journey, but we made it!'
				});
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Show sonner`);
			},
			$$slots: { default: true }
		});
	});
}