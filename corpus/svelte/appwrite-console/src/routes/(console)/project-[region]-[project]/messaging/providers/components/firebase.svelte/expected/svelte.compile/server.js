import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Firebase($$renderer) {
	SvgIcon($$renderer, { name: 'firebase', type: 'color' });
}