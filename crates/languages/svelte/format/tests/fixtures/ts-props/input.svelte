<script lang="ts">
	interface Props {
		name: string;
		count?: number;
	}

	let { name, count = 0 }: Props = $props();
	const shout = (s: string): string => s.toUpperCase();
</script>

<p>{shout(name)} has {count}</p>
