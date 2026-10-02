import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Output($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!----> `);
	Foo($$renderer, {});
	$$renderer.push(`<!---->`);
}