export class Config {
	#raw = $state({
		theme: 'dark',
		nested: {
			deep: [1, 2, 3],
		},
	});

	summary = $derived.by(() => {
		const keys = Object.keys(this.#raw);
		return keys
			.map((k) => `${k}!`)
			.join(', ');
	});

	handler = $state(
		(event) =>
			event.type === 'click'
				? 'clicked'
				: 'other',
	);

	matrix = $state([
		[1, 0],
		[0, 1],
	]);
}
