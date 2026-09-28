import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
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

	$$renderer.push(`<div${$.attributes({ ...userdata })}>content</div> <img${$.attributes({
		src: 'x',
		alt: 'photo',
		...{ onerror: 'alert(1)', onload: 'alert(1)' }
	})} onload="this.__e=event" onerror="this.__e=event"/>`);
}