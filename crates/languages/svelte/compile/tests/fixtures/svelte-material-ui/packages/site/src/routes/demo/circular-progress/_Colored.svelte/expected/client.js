import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircularProgress from '@smui/circular-progress';

var root = $.from_html(`<div style="display: flex; justify-content: center"><!></div>`);

export default function _Colored($$anchor) {
	var div = root();
	var node = $.child(div);

	CircularProgress(node, {
		class: 'my-colored-circle',
		style: 'height: 32px; width: 32px;',
		progress: 0.3
	});

	$.reset(div);
	$.append($$anchor, div);
}