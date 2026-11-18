<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	function withParam(goto) {
		goto('/shadowed-goto');
	}
	function baseShadow(base) {
		goto(base + '/shadowed-base');
	}
	void [withParam, baseShadow];
</script>
<p>shadow</p>
