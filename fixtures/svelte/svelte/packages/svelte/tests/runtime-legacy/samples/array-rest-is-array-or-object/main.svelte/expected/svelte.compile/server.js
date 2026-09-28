import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let [first, second, ...[third, ...[, fifth]]] = [1, 2, 3, 4, 5];
	let [one, two, ...[three, ...{ length }]] = [10, 20, 30, 40, 50, 60, 70, 80, 90];

	$$renderer.push(`<h1>${$.escape(first)}</h1> <h1>${$.escape(second)}</h1> <h1>${$.escape(third)}</h1> <h1>${$.escape(fifth)}</h1> <h1>${$.escape(one)}</h1> <h1>${$.escape(two)}</h1> <h1>${$.escape(three)}</h1> <h1>${$.escape(length)}</h1>`);
}