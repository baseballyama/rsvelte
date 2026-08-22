// A standalone module has no `<script>` element, so upstream's `inScriptElement`
// suppression never applies and every `$store.prop` access reports here.
import { writable } from 'svelte/store';

export const foo = writable({ bar: 1, baz: 2 });

const $foo = { bar: 1, baz: 2 };
const key = 'x';

export const direct = $foo.bar;

let alias = 0;
$: alias = $foo.baz;
export function bump() {
	alias += 1;
}

// a top-level key still resolves to module scope, so this reports
export const topLevelKey = $foo[`k${key}`];

// negative control: same access, but `key` is a function parameter
export function keyed(key) {
	return $foo[`k${key}`];
}

// negative control: a rune name is skipped, and a module is always runes mode
export const snap = $state.snapshot(foo);
