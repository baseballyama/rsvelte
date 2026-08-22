<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	function plain() {
		goto('/plain');
	}
	function prefixed() {
		goto(base + '/ok');
	}
</script>

<button onclick={plain}>plain</button>
<button onclick={prefixed}>prefixed</button>
