let real = $state(0);
let derived = $derived.by(() => real + 1);

const notes = [
	'$state.frozen(x) was removed',
	'$state.raw( is a prefix',
	'$derived.by( takes a thunk',
	'$props() only in components',
	'$inspect.trace( needs dev',
	'$host is for custom elements',
	'$state.snapshot( unwraps',
];

const pattern = /\$state\.raw\(|\$derived\.by\(/;

// $state.frozen( appears here too, in a comment about $props() and $host
export function info() {
	return notes.filter((n) => pattern.test(n)).length + derived;
}

export function bump() {
	real += 1;
}
