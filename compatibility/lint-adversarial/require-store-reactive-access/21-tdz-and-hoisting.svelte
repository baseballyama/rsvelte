<script>
	import { writable } from 'svelte/store';

	function early() {
		// reads the module-level store before its declaration is evaluated
		return s + 1;
	}

	const s = writable(0);

	function shadowedByHoistedDecl() {
		const r = s + 1;
		function s() {
			return 2;
		}
		return r + s();
	}

	const a = early();
	const b = shadowedByHoistedDecl();
</script>

<p>{a}{b}{$s}</p>
