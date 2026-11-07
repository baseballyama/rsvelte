import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_try01_input($$anchor) {
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