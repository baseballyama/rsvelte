<script>
	import { readable } from 'svelte/store';

	const s = readable(1);
	let re;
	let plain;
	let flags;
	let cls;
	let after_return;
	let in_interp;
	let text;
	let divided;

	// A regex body is text: `$s` here names nothing and must survive intact.
	$: plain = /\$s/;
	$: flags = /\$s/gi;
	$: cls = /[\$s]/;
	$: after_return = (() => {
		return /\$s/;
	})();
	$: in_interp = `${String(/\$s/)}`;

	// Already skipped, and the controls for the two directions of the scan:
	// a string is text, and a `/` after a value divides rather than opening a
	// regex — so the store read behind it still has to be rewritten.
	$: text = '$s';
	$: divided = 1 / 2 + $s;
	$: re = $s + 1;
</script>

<b>{$s}{plain}{flags}{cls}{after_return}{in_interp}{text}{divided}{re}</b>
