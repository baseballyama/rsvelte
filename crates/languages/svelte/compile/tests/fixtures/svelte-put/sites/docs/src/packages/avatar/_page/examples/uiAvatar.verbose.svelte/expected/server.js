import * as $ from 'svelte/internal/server';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function UiAvatar_verbose($$renderer) {
	Avatar($$renderer, {
		uiAvatar: {
			name: 'Jane+Hopper',
			background: '313131',
			color: 'FFFFFF',
			'font-size': 0.3,
			uppercase: true,
			rounded: true,
			length: 3,
			bold: true,
			size: 50,
			format: 'svg'
		}
	});
}