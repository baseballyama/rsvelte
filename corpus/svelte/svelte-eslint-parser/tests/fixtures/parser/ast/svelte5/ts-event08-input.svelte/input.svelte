<script lang="ts">
	let count = $state(0);
</script>

<button onclick={(event: number) => {
    count += event;
}}>
	clicks: {count}
</button>
