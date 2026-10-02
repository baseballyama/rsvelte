import * as $ from 'svelte/internal/server';
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';

export default function Avatar_02($$renderer) {
	Avatar($$renderer, {
		children: ($$renderer) => {
			AvatarFallback($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->KK`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}