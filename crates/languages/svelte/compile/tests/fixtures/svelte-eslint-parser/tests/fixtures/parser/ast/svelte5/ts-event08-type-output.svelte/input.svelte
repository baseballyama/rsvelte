<script lang="ts">
	let count = $state(0); // count: number, $state(0): 0
</script>

<button onclick={(event: number) => { // event: number
    count += event; // count: number, event: number
}}>
	clicks: {count} <!-- count: number -->
</button>
