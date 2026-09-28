import * as $ from 'svelte/internal/server';
import Slider from '@smui/slider';

export default function _Disabled($$renderer) {
	Slider($$renderer, { disabled: true, value: 5 });
}