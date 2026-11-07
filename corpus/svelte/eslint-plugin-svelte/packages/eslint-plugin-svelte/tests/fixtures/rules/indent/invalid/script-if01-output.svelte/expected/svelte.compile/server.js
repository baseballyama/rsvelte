import * as $ from 'svelte/internal/server';

export default function Script_if01_output($$renderer) {
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