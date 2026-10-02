import * as $ from 'svelte/internal/server';

export default function Script_unary01_output($$renderer) {
	async function* fn(...a) {
		yield a;
		yield* a;
		await a;
		o = { ...a };

		if (b) throw e;

		return a;
	}
}