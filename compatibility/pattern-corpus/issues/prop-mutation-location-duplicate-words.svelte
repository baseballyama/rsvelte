<script lang="ts">
	export let filter;
	export let step = { params: null };

	const targets = new Set();

	function clean() {
		filter.value = filter.value.filter((value) => targets.has(value));
	}

	function toggle(selected) {
		filter.value = filter.value.filter((value) =>
			selected ? value !== selected.id : value != null
		);
	}

	let params = step.params;
	(step.params as any) = params;
</script>

<button onclick={clean}>clean</button>
<button onclick={() => toggle(null)}>toggle</button>
