import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_for01_output($$anchor) {
	for (const key in object) {
		a();
	}

	for (const iterator of object) {
		a();
	}

	async function f() {
		for await (const iterator of object) {
			a();
		}
	}

	for (let index = 0; index < array.length; index++) {
		const element = array[index];
	}
}