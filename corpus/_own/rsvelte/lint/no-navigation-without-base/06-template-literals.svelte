<script>
	import { pushState } from '$app/navigation';
	import { base } from '$app/paths';
	const x = 'q';
	function f() {
		pushState(``, {});
	}
	function g() {
		pushState(`${''}`, {});
	}
	void [f, g];
</script>
<a href={`${base}/x`}>ok</a>
<a href={`${x}#a`}>bad</a>
<a href={`#${x}`}>ok</a>
<a href={``}>bad</a>
<a href={`${x}` + '#tail'}>bad</a>
