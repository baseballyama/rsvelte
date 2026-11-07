import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let data = { event: { author: 'John Doe', body: 'Body' } };
	const event = $.derived(() => data.event);

	if (event()) {
		$$renderer.push(`<!--[0--><h1>${$.escape(event().author)}</h1> <p>${$.escape(event().body)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>hide</button> <button>show</button>`);
}