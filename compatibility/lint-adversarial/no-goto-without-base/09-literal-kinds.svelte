<script>
	import { goto } from '$app/navigation';
	function f() {
		goto(0);
		goto(true);
		goto(null);
		goto(1n);
		goto(/regex-arg/);
		goto('mailto:a@b.example');
		goto('tel:+15551234567');
		goto('MAILTO:x@y.example');
		goto('+ssh:host');
	}
	void f;
</script>
<p>literals</p>
