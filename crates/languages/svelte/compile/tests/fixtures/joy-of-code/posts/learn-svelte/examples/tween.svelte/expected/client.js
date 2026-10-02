import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tween } from 'svelte/motion';
import { cubicInOut } from 'svelte/easing';

var root = $.from_html(`<div class="container"><svg width="400" height="400" viewBox="0 0 400 400"><circle cx="200" cy="200" fill="orangered"></circle></svg></div>`);

export default function Tween_1($$anchor, $$props) {
	$.push($$props, true);

	const size = new Tween(50, { duration: 300, easing: cubicInOut });

	function onmousedown() {
		size.target = 150;
	}

	function onmouseup() {
		size.target = 50;
	}

	var div = root();
	var svg = $.child(div);
	var circle = $.only_child(svg);

	$.reset(div);
	$.template_effect(() => $.set_attribute(circle, 'r', size.current));
	$.delegated('mousedown', circle, onmousedown);
	$.delegated('mouseup', circle, onmouseup);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousedown', 'mouseup']);