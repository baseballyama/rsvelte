import * as $ from 'svelte/internal/server';

export default function Wild($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { params = {} } = $$props;

		$$renderer.push(`<h2 class="routetitle">Wild</h2> <p>Your message is: ${$.escape(params.wild)}</p>`);
	});
}