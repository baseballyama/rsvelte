import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function Apple($$anchor) {
	SvgIcon($$anchor, { name: 'apple', type: 'color' });
}