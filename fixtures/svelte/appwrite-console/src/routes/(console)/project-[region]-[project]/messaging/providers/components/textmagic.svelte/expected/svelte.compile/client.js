import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function Textmagic($$anchor) {
	SvgIcon($$anchor, { name: 'textmagic', type: 'color' });
}