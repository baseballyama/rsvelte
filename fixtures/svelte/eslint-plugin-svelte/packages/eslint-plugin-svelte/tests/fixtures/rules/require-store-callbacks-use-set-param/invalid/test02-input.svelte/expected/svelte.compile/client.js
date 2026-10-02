import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { readable, writable } from 'svelte/store';

export default function Test02_input($$anchor, $$props) {
	$.push($$props, true);
	readable(false, function () {});
	readable(false, (foo) => function () {});
	writable(false, () => function () {});
	writable(false, (foo) => function () {});
	$.pop();
}