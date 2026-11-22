<script module>
	'use strict';
	'module directive';
	export const m = 1;
	'module string';
</script>

<script>
	"use client";
	'x';
	let v = $state(1);
	'after a declaration';
	function f() {
		'use strict';
		g();
		'h';
	}
	function g() {}
</script>

<p>{v}{f()}</p>
