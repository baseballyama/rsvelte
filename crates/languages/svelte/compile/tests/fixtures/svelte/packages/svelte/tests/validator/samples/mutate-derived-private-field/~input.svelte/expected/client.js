import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	class Test {
		#der = $.derived(() => ({ test: 0 }));

		set test(v) {
			$.get(this.#der).test = 45;
		}
	}

	$.pop();
}