<script lang="ts" generics="T extends string">
	let { value }: { value: T } = $props();
	export function open(id: T) {
		return id;
	}
</script>

<p>{value}</p>
