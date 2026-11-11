<script>
	import { goto } from '$app/navigation';
	function f() {
		goto(':');
		goto('a1:');
		goto('//host/x');
		goto('');
		goto('?query=1');
		goto('#hash');
		goto('data:text/plain,x');
		goto('HTTPS://EXAMPLE.COM');
		goto('++:');
	}
	void f;
</script>
<p>scheme regex edges</p>
