<script module>
	export const shared = { hits: 0 };
	export function tally() {
		shared.hits += 1;
		return shared.hits;
	}
	let moduleState = 'm';
</script>

<script>
	let local = $state(tally());
	moduleState += '!';
</script>

<button onclick={() => (local = tally())}>{local} {moduleState} {shared.hits}</button>
