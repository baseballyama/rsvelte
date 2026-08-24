let a = $state(1);
let d = $derived(a * 2);

$inspect(a);
$inspect(a, a + 1);
$inspect(a).with(console.log);

function f() {
	$inspect(a);
	$effect(() => a);
}

class C {
	m() {
		$inspect(d);
	}
}

export const z = 1;

export function use() {
	f();
	new C().m();
	return a + d + z;
}
