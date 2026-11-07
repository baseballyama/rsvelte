import * as $ from 'svelte/internal/server';

export default function Comp($$renderer, $$props) {
	let { children } = $$props;
	const snippetProps = $.derived(() => ({ id: '123', name: 'my-select' }));

	children($$renderer, { props: snippetProps() });
	$$renderer.push(`<!---->`);
}