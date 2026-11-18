let [x, [y]] = $state([1, [2]]);
let { a, ...rest } = $state({ a: 1, b: 2 });
let [p, q] = $state.raw([1, 2]);

export function bump(x) {
	x = 0;
	y += 1;
	a = 2;
	rest = { c: 3 };
	q = [9];
	return [x, y, a, rest, p, q];
}

export function make() {
	let { v, w } = $state({ v: 1, w: 2 });
	return {
		get w() {
			return v + w;
		},
		set w(n) {
			w = n;
		}
	};
}
