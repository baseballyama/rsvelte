import * as $ from 'svelte/internal/server';
import LinearProgress from '@smui/linear-progress';

export default function _Colored($$renderer) {
	LinearProgress($$renderer, {
		class: 'my-colored-linear-progress',
		progress: 0.5,
		buffer: 0.75
	});
}