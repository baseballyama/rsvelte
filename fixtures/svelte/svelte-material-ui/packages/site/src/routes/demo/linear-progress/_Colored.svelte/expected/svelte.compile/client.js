import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LinearProgress from '@smui/linear-progress';

export default function _Colored($$anchor) {
	LinearProgress($$anchor, {
		class: 'my-colored-linear-progress',
		progress: 0.5,
		buffer: 0.75
	});
}