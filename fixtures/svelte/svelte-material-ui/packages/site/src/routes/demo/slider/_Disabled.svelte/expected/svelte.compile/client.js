import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from '@smui/slider';

export default function _Disabled($$anchor) {
	Slider($$anchor, { disabled: true, value: 5 });
}