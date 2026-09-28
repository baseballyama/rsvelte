import * as $ from 'svelte/internal/server';

export default function Regex($$renderer, $$props) {
	let { params = {} } = $$props;

	$$renderer.push(`<h2 class="routetitle">Regex route</h2> <p>Match is: <code id="regexmatch">${$.escape(JSON.stringify(params))}</code></p>`);
}