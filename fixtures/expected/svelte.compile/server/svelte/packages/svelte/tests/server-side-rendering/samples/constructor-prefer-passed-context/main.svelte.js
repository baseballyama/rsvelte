import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { render } from 'svelte/server';
import ChildComponent from './ChildComponent.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext('foo', true);

		const content = render(ChildComponent, { props: {}, context: new Map() }).html;

		$$renderer.push(`<div>${$.html(content)}</div>`);
	});
}