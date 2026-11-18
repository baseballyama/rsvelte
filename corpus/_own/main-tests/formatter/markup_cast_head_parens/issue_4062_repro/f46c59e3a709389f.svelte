<script lang="ts">
	let { type }: { type: 'a' | 'b' } = $props();
</script>

<button type={type as 'a' | 'b'}>x</button>
