import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_class01_output($$anchor) {
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