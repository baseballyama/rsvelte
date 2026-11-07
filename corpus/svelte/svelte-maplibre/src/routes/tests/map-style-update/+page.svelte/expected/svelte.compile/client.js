import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

var root = $.from_html(`<button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Swap Style</button> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let styles = $.state($.proxy([
		'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
	]));

	function swapStyle() {
		$.set(styles, [...$.get(styles)].reverse(), true);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	MapLibre(node, {
		get style() {
			return $.get(styles)[0];
		},
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		standardControls: true
	});

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		},
		startBoundary: 'let styles',
		endBoundary: '/>'
	});

	$.delegated('click', button, swapStyle);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);