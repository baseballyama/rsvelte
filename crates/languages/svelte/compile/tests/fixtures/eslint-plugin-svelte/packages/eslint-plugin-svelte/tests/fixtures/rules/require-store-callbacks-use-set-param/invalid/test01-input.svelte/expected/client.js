import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { readable, writable } from 'svelte/store';

export default function Test01_input($$anchor, $$props) {
	$.push($$props, true);
	readable(false, () => true);
	readable(false, (foo) => true);
	writable(false, () => true);
	writable(false, (foo) => true);

	readable(false, (foo) => {
		foo;

		insideACallback(() => {
			foo;
		});

		conflictingName(() => {
			const foo = 303;

			foo;
		});
	});

	readable(false, () => {
		const set = 303;
	});

	insideACallback(() => {
		const set = 303;

		readable(false, () => {
			set;
		});
	});

	$.pop();
}