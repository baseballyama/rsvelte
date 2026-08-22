<script>
	import { goto } from '$app/navigation';
	import { base as b } from '$app/paths';
	const copied = b;
	function ok() {
		goto(b + '/aliased');
	}
	function bad() {
		goto(copied + '/copied');
	}
	function tpl() {
		goto(`${b}/aliased-template`);
	}
	void [ok, bad, tpl];
</script>
<p>base alias</p>
