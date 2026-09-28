import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircularProgress from '@smui/circular-progress';

var root = $.from_html(`<div style="display: flex; justify-content: center"><!></div>`);

export default function _Indeterminate($$anchor) {
	var div = root();
	var node = $.child(div);

	CircularProgress(node, { style: 'height: 32px; width: 32px;', indeterminate: true });
	$.reset(div);
	$.append($$anchor, div);
}