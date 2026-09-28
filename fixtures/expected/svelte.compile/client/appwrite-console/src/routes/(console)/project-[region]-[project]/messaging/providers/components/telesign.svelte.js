import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function Telesign($$anchor) {
	SvgIcon($$anchor, { name: 'telesign', type: 'color' });
}