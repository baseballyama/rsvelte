import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function action(node) {
		node;

		return {
			// TODO: replace this with the Svelte interface generic once it lands in Svelte
			$$_attributes: {
				foo: 'string',
				'on:bar': (e) => {
					e;
				}
			}
		};
	}

	function onBar(e) {
		e;
	}

	function onWrongBar(e) {
		e;
	}

	$$renderer.push(`<div foo="valid"></div> <div${$.attr('foo', 1)}></div> <div foo="valid"></div>`);
}