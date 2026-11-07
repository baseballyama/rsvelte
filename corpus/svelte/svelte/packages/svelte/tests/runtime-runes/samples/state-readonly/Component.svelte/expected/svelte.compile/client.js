import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component2 from './Component2.svelte';

export default function Component($$anchor, $$props) {
	function render(state) {
		return state;
	}

	{
		let $0 = $.derived(() => render($$props.state));

		Component2($$anchor, {
			get state() {
				return $.get($0);
			}
		});
	}
}