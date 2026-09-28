import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			'foo-bar': ($$renderer) => {
				$$renderer.push(`<p slot="foo-bar">Hello</p>`);
			}
		}
	});
}