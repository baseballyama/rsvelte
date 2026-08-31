<script lang="ts">
	// ESLint merges a redeclared `let` into one variable with two write
	// references, so its single-writer check rejects the whole binding.
	let dup = 10;
	let dup = 20;

	// A same-named `let` in a nested scope is a different variable and still
	// reports — the guard must be per symbol, not per name.
	function f() {
		let dup = 30;
		return dup;
	}

	let single = 40;
	void [dup, f, single];
</script>
<p>redeclared</p>
