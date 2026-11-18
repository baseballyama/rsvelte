<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	const seg = 'x';
	function f() {
		goto(`${base}`);
		goto(`${'/literal-first'}`);
		goto(`${seg}${base}`);
		goto(`${base}${seg}`);
		goto(`plain-text-only`);
	}
	void f;
</script>
<p>template literal parts</p>
