let a = $state(1);
let d = $derived(a * 2);
class C {
	m() {
		$inspect(a);
	}
}
export const z = 1;
export function use() { return a + d; }
