import * as $ from 'svelte/internal/server';
import Bla from './Bla.svelte';

export default function Input($$renderer) {
	Bla($$renderer, {
		$$slots: {
			foo: ($$renderer, { bar, clickFn }) => {
				$$renderer.push(`<button slot="foo"${$.attr_class('', void 0, { 'bar': bar })}>${$.escape(bar)}</button>`);
			}
		}
	});
}