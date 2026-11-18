export class C {
	opts;
	constructor(opts) {
		this.opts = opts;
	}
	first = $derived.by(() => ({ a: this.opts.a }));
	second = $derived.by(
		() => ({
			b: 2,
			last: 3
		})
	);
}
