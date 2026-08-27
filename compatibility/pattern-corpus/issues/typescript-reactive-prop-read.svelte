<script lang="ts">
	export let tab: { id: string } | undefined;
	let selected = "";

	$: {
		if (tab) {
			[tab].forEach((value: { id: string }) => {
				selected = value.id;
			});
		}
	}
</script>

<p>{selected}</p>
