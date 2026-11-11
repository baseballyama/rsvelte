const items = $state([1, 2, 3]);

export function push(n) {
	items.push(n);
}

export function* walk() {
	outer: for (const a of items) {
		inner: for (const b of items) {
			if (a === b) continue outer;
			if (a + b > 4) break inner;
			yield [a, b];
		}
	}
}

export async function* stream() {
	for await (const chunk of walk()) {
		yield chunk;
	}
}

const total = $derived.by(function () {
	let n = 0;
	block: {
		if (items.length === 0) break block;
		n = items.reduce((s, x) => s + x, 0);
	}
	return n;
});

export function getTotal() {
	return total;
}
