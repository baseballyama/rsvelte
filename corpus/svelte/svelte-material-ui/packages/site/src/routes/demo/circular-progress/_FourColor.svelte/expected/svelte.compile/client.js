import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircularProgress from '@smui/circular-progress';

var root = $.from_html(`<div style="display: flex; justify-content: center"><!></div>`);

export default function _FourColor($$anchor) {
	var div = root();
	var node = $.child(div);

	CircularProgress(node, {
		class: 'my-four-colors',
		style: 'height: 32px; width: 32px;',
		indeterminate: true,
		fourColor: true
	});

	$.reset(div);
	$.append($$anchor, div);
}