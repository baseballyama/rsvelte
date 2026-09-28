import * as $ from 'svelte/internal/server';
import CircularProgress from '@smui/circular-progress';

export default function _Colored($$renderer) {
	$$renderer.push(`<div style="display: flex; justify-content: center">`);

	CircularProgress($$renderer, {
		class: 'my-colored-circle',
		style: 'height: 32px; width: 32px;',
		progress: 0.3
	});

	$$renderer.push(`<!----></div>`);
}