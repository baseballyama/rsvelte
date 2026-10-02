import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function Mailgun($$anchor) {
	SvgIcon($$anchor, { name: 'mailgun', type: 'color' });
}