<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	let url = '/dynamic';
	const obj = { href: '/from-object' };
	function f() {
		goto(url);
		goto(obj.href);
		goto(url ? base + '/y' : '/z');
		goto(new URL('/x', 'https://e.example'));
		goto(base);
	}
	void f;
</script>
<p>non-literal first arguments</p>
