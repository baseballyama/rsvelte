import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './component.svelte';

var root = $.from_html(`<label><!></label>`);

export default function Input($$anchor) {
	var label = root();
	var node = $.child(label);

	$.snippet(node, () => x);
	$.reset(label);
	$.append($$anchor, label);
}