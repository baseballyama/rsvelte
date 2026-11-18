<script>
	let { p } = $props();
	let s = $state(1);
	const fixed = 'k';
</script>

<em>x{void p}</em>
<i>y{fixed}</i>
<u>z{s}</u>
<button onclick={() => s++}>go</button>
