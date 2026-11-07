import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_unary01_output($$anchor) {
	async function* fn(...a) {
		yield a;
		yield* a;
		await a;
		o = { ...a };

		if (b) throw e;

		return a;
	}
}