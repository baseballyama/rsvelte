import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Custom_styling($$anchor, $$props) {
	/** passed from parent */
	let color = $.prop($$props, 'color', 3, 'blue');

	var fragment = root();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({ '--border-color': color() }));

		Avatar(node.lastChild, {
			src: 'https://img.freepik.com/free-photo/adorable-jack-russell-retriever-puppy-portrait_53876-64825.jpg?w=2000',
			uiAvatar: 'Jim+Hopper',
			size: 50,
			class: 'custom-avatar rounded-full'
		});

		$.reset(node);
	}

	$.append($$anchor, fragment);
}