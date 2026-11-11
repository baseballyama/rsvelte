<script module lang="ts">
	export const answer = 42;
	export type Answer = number;
	export function double(n: number) {
		return n * 2;
	}
</script>

<script lang="ts">
	let value = $state('');
</script>

<enhanced:img src="./a.png" alt={value} />
