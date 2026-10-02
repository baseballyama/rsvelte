import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function Resend($$anchor) {
	SvgIcon($$anchor, { name: 'resend', type: 'color' });
}