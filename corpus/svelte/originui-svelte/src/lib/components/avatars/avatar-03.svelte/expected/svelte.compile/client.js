import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UserRound from '@lucide/svelte/icons/user-round';
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';

export default function Avatar_03($$anchor) {
	Avatar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			AvatarFallback($$anchor, {
				children: ($$anchor, $$slotProps) => {
					UserRound($$anchor, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}