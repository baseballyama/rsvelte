import * as $ from 'svelte/internal/server';

export default function Script_class01_input($$renderer) {
	class A {
		static s() {}
		get a() {}
		set a(a) {}
		f() {}
	}

	class B extends A {
		f() {}
	}

	a = class {
		f() {}
	};
}