import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Resend($$renderer) {
	SvgIcon($$renderer, { name: 'resend', type: 'color' });
}