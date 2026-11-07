import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LinearProgress from '@smui/linear-progress';

export default function _Indeterminate($$anchor) {
	LinearProgress($$anchor, { indeterminate: true });
}