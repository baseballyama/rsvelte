export class A {
	n = $state(0);
	held = $derived(class {
		deep = $state(1);
	});
}
