import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Typography from './_Typography.svelte';

var root = $.from_html(`<section><h2>Typography</h2> <p>Part of <code>@smui/common</code>.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/common</pre> <h5>Demos</h5> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('110kll4', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Typography - SMUI';
		});
	});

	var node = $.sibling($.child(section), 10);

	Demo(node, {
		get component() {
			return Typography;
		},

		files: [
			'typography/_Typography.svelte',
			'typography/_Typography.scss'
		]
	});

	$.reset(section);
	$.append($$anchor, section);
}