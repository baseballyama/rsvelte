export class C {
	h = $state(
		(e) =>
			e.type === 'click'
				? 'a'
				: 'b',
	);
}
