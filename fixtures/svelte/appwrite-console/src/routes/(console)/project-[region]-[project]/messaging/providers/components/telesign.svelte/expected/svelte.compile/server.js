import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Telesign($$renderer) {
	SvgIcon($$renderer, { name: 'telesign', type: 'color' });
}