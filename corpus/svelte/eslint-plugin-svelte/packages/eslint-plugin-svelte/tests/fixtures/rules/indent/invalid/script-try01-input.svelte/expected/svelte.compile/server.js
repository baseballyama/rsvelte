import * as $ from 'svelte/internal/server';

export default function Script_try01_input($$renderer) {
	try {
		a = 1;
	} catch(e) {
		a = 2;
	} finally {
		a = 3;
	}

	try {
		a = 1;
	} catch {
		a = 2;
	} finally {
		a = 3;
	}
}