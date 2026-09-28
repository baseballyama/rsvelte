import * as $ from 'svelte/internal/server';
import UserRound from '@lucide/svelte/icons/user-round';
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';

export default function Avatar_03($$renderer) {
	Avatar($$renderer, {
		children: ($$renderer) => {
			AvatarFallback($$renderer, {
				children: ($$renderer) => {
					UserRound($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}