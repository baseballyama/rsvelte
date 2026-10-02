import * as $ from 'svelte/internal/server';
import Hoverable from './Hoverable.svelte';

export default function Let_directive02_input($$renderer) {
	Hoverable($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { hovering: { foo: active } }) => {
				$$renderer.push(`<div${$.attr_class('', void 0, { 'active': active })}></div>`);
			}
		}
	});
}