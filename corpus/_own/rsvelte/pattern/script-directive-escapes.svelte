<script module>
	"it\'s";
	"a\u{1F600}b";
	"use\x20strict";
	export const m = 1;
</script>

<script>
	"a\nb";
	"it\'s";
	"\
x";
	let v = $state(1);
</script>

<p>{v}{m}</p>
