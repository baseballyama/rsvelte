export class Config {
	handler = $state(
		(event) =>
			event.type === 'click'
				? 'clicked'
				: 'other',
	);

	label = $derived.by(
		() => `${this.handler({ type: 'click' })}!`,
	);
}
