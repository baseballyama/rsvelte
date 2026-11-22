<script lang="ts">
	let { n }: { n: number } = $props();
	}
	let z = 1;
</script>

<slot />
<p>{n}{z}</p>
