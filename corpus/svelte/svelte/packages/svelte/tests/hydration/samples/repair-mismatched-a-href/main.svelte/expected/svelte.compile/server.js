import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { browser } = $$props;

	$$renderer.push(`<a${$.attr('href', browser ? '/foo' : '/bar')}>foo</a> <a${$.attributes({ ...{ href: browser ? '/foo' : '/bar' } })}>foo</a>`);
}