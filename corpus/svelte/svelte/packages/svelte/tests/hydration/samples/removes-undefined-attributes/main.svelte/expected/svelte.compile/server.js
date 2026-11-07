import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	const { browser } = $$props;
	const attributes = { "data-test": browser ? undefined : "" };

	$$renderer.push(`<div${$.attributes({ ...attributes })}></div>`);
}