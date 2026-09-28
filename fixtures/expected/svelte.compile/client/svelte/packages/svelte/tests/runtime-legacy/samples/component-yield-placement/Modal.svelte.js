import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<div class="modal-background"></div> <div class="modal"><!> <button>close modal</button></div>`, 1);

export default function Modal($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	const destroy = () => dispatch('destroy');
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

	$.slot(node, $$props, 'default', {}, null);

	var button = $.sibling(node, 2);

	$.reset(div_1);
	$.event('click', div, destroy);
	$.event('click', button, destroy);
	$.append($$anchor, fragment);
	$.pop();
}