import * as $ from 'svelte/internal/server';

export default function Name($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { params = {} } = $$props;

		$$renderer.push(`<h2>Hi there!</h2> <p>Your name is: <b>${$.escape(params.first)}</b> <b>`);

		if (params.last) {
			$$renderer.push(`<!--[0-->${$.escape(params.last)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></b></p> <p>This comes from the URL, matching <code>/hello/:first/:last?</code>, where the last name is optional.</p> <p><em>Hint:</em> Try changing the URL and add your name, e.g. <code>/hello/alex</code> or <code>/hello/jane/doe</code></p>`);
	});
}