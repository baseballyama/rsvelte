import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Mailgun($$renderer) {
	SvgIcon($$renderer, { name: 'mailgun', type: 'color' });
}