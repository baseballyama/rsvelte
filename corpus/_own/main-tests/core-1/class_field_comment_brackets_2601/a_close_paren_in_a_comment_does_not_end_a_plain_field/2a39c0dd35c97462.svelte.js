export class C {
	opts;
	constructor(opts) {
		this.opts = opts;
	}
	first = $derived.by(() => ({ a: this.opts.a }));
	second = f(
		// ) c
		1,
		2
	);
	last = 3;
}
