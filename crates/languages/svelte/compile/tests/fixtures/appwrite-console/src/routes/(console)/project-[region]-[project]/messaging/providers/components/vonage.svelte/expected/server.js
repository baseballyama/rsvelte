import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Vonage($$renderer) {
	SvgIcon($$renderer, { name: 'vonage', type: 'color' });
}