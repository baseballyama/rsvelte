<script>
	import { onMount } from 'svelte';

	function h() {}
	onMount(() => {
		window.addEventListener('resize', h);
		document.addEventListener('click', h);
		addEventListener('scroll', h);
		window.removeEventListener('resize', h);
	});
</script>

<p>ok</p>
