import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>content</div> <img/>`, 1);

export default function Main($$anchor) {
	const userdata = {
		id: 'profile-123',
		class: 'card',
		onclick: 'alert(1)',
		onerror: 'alert(1)',
		onfocus: 'alert(1)',
		onmouseover: 'alert(1)',
		' onload': 'alert(1)',
		'\tonload': 'alert(1)',
		'\u00a0onload': 'alert(1)',
		"\t": "/onmouseover=alert(1)//",
		"": "/onmouseover=alert(1)//"
	};

	var fragment = root();
	var div = $.first_child(fragment);

	$.attribute_effect(div, () => ({ ...userdata }));

	var img = $.sibling(div, 2);

	$.attribute_effect(img, () => ({
		src: 'x',
		alt: 'photo',
		...{ onerror: 'alert(1)', onload: 'alert(1)' }
	}));

	$.replay_events(img);
	$.append($$anchor, fragment);
}