import * as $ from 'svelte/internal/server';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

export default function Custom_styling($$renderer, $$props) {
	/** passed from parent */
	let { color = 'blue' } = $$props;

	$.css_props($$renderer, true, { '--border-color': color }, () => {
		Avatar($$renderer, {
			src: 'https://img.freepik.com/free-photo/adorable-jack-russell-retriever-puppy-portrait_53876-64825.jpg?w=2000',
			uiAvatar: 'Jim+Hopper',
			size: 50,
			class: 'custom-avatar rounded-full'
		});
	});
}