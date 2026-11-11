export class T {
	id =
		'crypto' in globalThis && crypto.randomUUID
			// ; c
			? crypto.randomUUID()
			: Math.random().toString(36).slice(2);

	active = $state(undefined);
}
