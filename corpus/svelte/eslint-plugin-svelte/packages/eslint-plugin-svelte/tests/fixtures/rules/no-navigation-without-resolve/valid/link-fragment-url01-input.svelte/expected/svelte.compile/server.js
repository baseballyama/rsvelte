import * as $ from 'svelte/internal/server';

export default function Link_fragment_url01_input($$renderer) {
	const section = 'sectionName';
	const value = '#section';
	const href = '#section';

	$$renderer.push(`<a href="#">Click me!</a> <a href="#section">Click me!</a> <a href="#section">Click me!</a> <a${$.attr('href', '#' + 'section')}>Click me!</a> <a${$.attr('href', '#' + section)}>Click me!</a> <a${$.attr('href', `#${section}`)}>Click me!</a> <a href="#user:42">Click me!</a> <a${$.attr('href', value)}>Click me!</a> <a${$.attr('href', href)}>Click me!</a>`);
}