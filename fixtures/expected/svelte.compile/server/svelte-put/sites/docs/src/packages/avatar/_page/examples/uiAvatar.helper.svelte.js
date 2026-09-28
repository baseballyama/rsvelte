import * as $ from 'svelte/internal/server';
import { uiAvatar } from '@svelte-put/avatar';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function UiAvatar_helper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uiAvatarUrl = uiAvatar({
			name: 'Steve+Harrington',
			background: '313131',
			color: 'FFFFFF',
			'font-size': 0.3,
			uppercase: true,
			rounded: true,
			length: 3,
			bold: true,
			size: 50,
			format: 'svg'
		});

		Avatar($$renderer, { src: uiAvatarUrl });
	});
}