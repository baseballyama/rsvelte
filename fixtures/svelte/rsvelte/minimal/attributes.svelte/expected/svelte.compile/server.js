import * as $ from 'svelte/internal/server';

export default function Attributes($$renderer, $$props) {
	let { href, label } = $$props;

	$$renderer.push(`<a${$.attr('href', href)} class="link"${$.attr('title', `go to ${$.stringify(label)}`)}>${$.escape(label)}</a>`);
}