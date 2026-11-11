export class A {
	held = $state(new (class {
		deep = $state(1);
	})());
}
