import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';

export default function Avatar_02($$anchor) {
	Avatar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			AvatarFallback($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('KK');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}