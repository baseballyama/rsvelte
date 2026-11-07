import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function Sendgrid($$anchor) {
	SvgIcon($$anchor, { name: 'sendgrid', type: 'color' });
}