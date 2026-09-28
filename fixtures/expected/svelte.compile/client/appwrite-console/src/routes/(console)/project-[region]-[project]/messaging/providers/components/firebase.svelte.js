import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function Firebase($$anchor) {
	SvgIcon($$anchor, { name: 'firebase', type: 'color' });
}