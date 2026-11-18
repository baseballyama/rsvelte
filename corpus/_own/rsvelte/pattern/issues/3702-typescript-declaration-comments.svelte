<script lang="ts">
	// interface docs
	interface Props {
		name: string, // property docs
		ready(): void
	}

	// alias docs
	type Alias<T> = T | null;

	let value: Alias<Props["name"]> = "ready";
</script>

<p>{value}</p>
