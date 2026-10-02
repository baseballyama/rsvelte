<script lang="ts">
	let count = $state(0); // count: number, $state(0): 0
</script>

<button
	on:click={(e: MouseEvent) => { // e: MouseEvent
		const next: number = count + 1; // next: number, count: number
		count = next; // count: number, next: number
	}}
>clicks: {count}</button> <!-- count: number -->
