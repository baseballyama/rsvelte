import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Sendgrid($$renderer) {
	SvgIcon($$renderer, { name: 'sendgrid', type: 'color' });
}