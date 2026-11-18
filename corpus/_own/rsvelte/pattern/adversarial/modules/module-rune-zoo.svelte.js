let count = $state(0);
let history = $state.raw([]);
const doubled = $derived(count * 2);
const summary = $derived.by(() => `${count}/${doubled}`);

export function increment(by = 1) {
	count += by;
	history = [...history, $state.snapshot(count)];
}

export function summarize() {
	return summary;
}

export class Counter {
	value = $state(0);
	#quad = $derived(this.value * 4);
	static shared = new Map();

	get quad() {
		return this.#quad;
	}

	set quad(v) {
		this.value = v / 4;
	}

	bump = () => {
		this.value += 1;
	};
}

export const effects = $effect.root(() => {
	$effect(() => {
		void count;
	});
	return () => {};
});
