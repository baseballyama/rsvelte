let base = $state(1);
export function go() {
	$effect.root(() => { console.log(base); });
}
