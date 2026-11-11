<script lang="ts">
	export let selected: { from: number; to: number } | undefined;

	function apply() {
		selected!.from = 1;
		selected!.to = 2;
	}
</script>

<button onclick={apply}>apply</button>
