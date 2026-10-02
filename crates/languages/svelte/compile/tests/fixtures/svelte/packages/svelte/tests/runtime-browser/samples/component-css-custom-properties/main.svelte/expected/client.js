import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slider from './Slider.svelte';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({
			'--rail-color': 'rgb(0, 0, 0)',
			'--track-color': 'rgb(255, 0, 0)'
		}));

		Slider(node.lastChild, { id: 'slider-1' });
		$.reset(node);
	}

	var node_1 = $.sibling(node, 2);

	{
		$.css_props(node_1, () => ({
			'--rail-color': 'rgb(0, 255, 0)',
			'--track-color': 'rgb(0, 0, 255)'
		}));

		Slider(node_1.lastChild, { id: 'slider-2' });
		$.reset(node_1);
	}

	$.append($$anchor, fragment);
}