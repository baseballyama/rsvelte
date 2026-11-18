class K {
	one =  $derived(1);
	tab =	$derived(2);
	newline =
		$derived(3);
	comment = /* keep */ $derived(4);
	nbsp = $derived(5);
	bom =﻿$derived(6);

	state =  $state(7);
	raw = /* keep */ $state.raw(8);
}

export const k = new K();
