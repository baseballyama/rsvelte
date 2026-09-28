import * as $ from 'svelte/internal/server';
import LinearProgress from '@smui/linear-progress';

export default function _Buffered($$renderer) {
	LinearProgress($$renderer, { progress: 0.5, buffer: 0.75 });
}