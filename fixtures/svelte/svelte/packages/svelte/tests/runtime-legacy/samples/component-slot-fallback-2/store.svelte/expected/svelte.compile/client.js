import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

let value = 'Blub';
let count = 0;
const subscribers = new Set();

export const model = {
	subscribe(fn) {
		subscribers.add(fn);
		count++;
		fn(value);

		return () => {
			count--;
			subscribers.delete(fn);
		};
	},

	set(v) {
		value = v;
		subscribers.forEach((fn) => fn(v));
	},

	getCount() {
		return count;
	}
};

export default function Store($$anchor, $$props) {
	$.push($$props, true);
	$.pop();
}