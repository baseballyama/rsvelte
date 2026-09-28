import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Main($$anchor) {
	let arr = $.proxy([]);
	let arr2 = $.proxy([]);
	let len = $.derived(() => arr.length + arr2.length);
	var bind_get = () => $.get(len) % 2 === 0 ? arr : arr2;
	var bind_set = (v) => {};

	Child($$anchor, {
		get arr() {
			return bind_get();
		},

		set arr($$value) {
			bind_set($$value);
		}
	});
}