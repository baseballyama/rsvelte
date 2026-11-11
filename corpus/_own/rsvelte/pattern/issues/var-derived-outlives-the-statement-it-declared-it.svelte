<script>
	// `var` is function-scoped, so a `$derived` declared as the BARE body of an
	// `if` / loop / labeled statement is still live afterwards and its read must
	// lower to `value?.()` on the server. The rows below put the read OUTSIDE
	// the container that declared it.
	function bare_if(flag) {
		if (flag) var value = $derived(1);

		return value;
	}

	function bare_if_alternate(flag) {
		if (!flag) ; else var value = $derived(2);

		return value;
	}

	function bare_labeled(flag) {
		declaration: var value = $derived(3);

		return value;
	}

	function bare_for(flag) {
		for (let once = 0; once < 1; once += 1) var value = $derived(4);

		return value;
	}

	function bare_for_of(flag) {
		for (const item of [flag]) var value = $derived(5);

		return value;
	}

	function bare_while(flag) {
		while (flag) var value = $derived(6);

		return value;
	}

	// The two containers whose read is INSIDE the container already worked, and
	// they are the reason the defect is not "a var derived is never registered":
	// the frame the declaration lands in is still on the stack here.
	function inside_switch(flag) {
		switch (flag) {
			case true:
				var value = $derived(7);
				return value;
		}

		return 0;
	}

	function inside_labeled_block(flag) {
		declaration: {
			var value = $derived(8);

			return value;
		}
	}

	// Reads through a closure and through a nested function declaration reach the
	// binding by a different path than a sibling statement does.
	function through_closure(flag) {
		if (flag) var value = $derived(9);

		return (() => value)();
	}

	function through_nested_function(flag) {
		if (flag) var value = $derived(10);

		function inner() {
			return value;
		}

		return inner();
	}

	// Positive control: a PLAIN `var` must stay a plain local. Wrapping this is
	// the defect the shadow set exists to prevent, so a fix that simply stopped
	// hoisting `var` names would pass every row above and break this one.
	function plain(flag) {
		if (flag) var value = 11;

		return typeof value;
	}

	// Positive control on the other side: a `var` inside a NESTED function must
	// not leak out to the enclosing one.
	function nested_does_not_leak(flag) {
		function inner() {
			if (flag) var value = $derived(12);

			return value;
		}

		return inner();
	}
</script>

<button onclick={() => bare_if(true)}>{bare_if_alternate(false)}</button>
<button onclick={() => bare_labeled(true)}>{bare_for(true)}</button>
<button onclick={() => bare_for_of(true)}>{bare_while(true)}</button>
<button onclick={() => inside_switch(true)}>{inside_labeled_block(true)}</button>
<button onclick={() => through_closure(true)}>{through_nested_function(true)}</button>
<button onclick={() => plain(true)}>{nested_does_not_leak(true)}</button>
