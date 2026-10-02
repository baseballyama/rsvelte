import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Twilio($$renderer) {
	SvgIcon($$renderer, { name: 'twilio', type: 'color' });
}