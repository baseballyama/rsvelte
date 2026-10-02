import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_if01_output($$anchor) {
	if (a) {
		b = c;
	}

	if (a) b = c;
	if (a) b = c; else c = b;

	if (a) {
		b = c;
	} else {
		c = b;
	}

	if (a) {
		b = c;
	} else if (d) {
		c = b;
	}

	if (a) {
		b = c;
	} else if (d) {
		c = b;
	}
}