import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function SvelteFrameworkIcon($$anchor) {
	SvgIcon($$anchor, { name: 'svelte', type: 'color' });
}