export class S {
	v = $state(0);
	async load() {
		for await (const x of gen()) this.v = x;
	}
}
