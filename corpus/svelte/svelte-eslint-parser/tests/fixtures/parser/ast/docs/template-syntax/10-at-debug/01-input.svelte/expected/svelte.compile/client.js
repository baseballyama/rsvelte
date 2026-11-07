import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _1_input($$anchor) {
	$.template_effect(() => {
		console.log({});

		debugger;
	});

	$.template_effect(() => {
		console.log({
			var1: $.snapshot(var1),
			var2: $.snapshot(var2),
			v3: $.snapshot(v3),
			varN: $.snapshot(varN)
		});

		debugger;
	});
}