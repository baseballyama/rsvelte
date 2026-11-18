<!-- The module's string statement prints right after the state prelude, not as a directive. -->
<script module>
	;
	'module text';
	export const shared = 1;
</script>

<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>{shared} {count}</button>
