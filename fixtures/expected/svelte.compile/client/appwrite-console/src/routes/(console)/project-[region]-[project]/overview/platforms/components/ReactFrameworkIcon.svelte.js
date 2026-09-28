import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function ReactFrameworkIcon($$anchor) {
	SvgIcon($$anchor, { name: 'react', type: 'color' });
}