<script>
	let calls = 0;

	function declared() {
		'script declaration';
		return 1;
	}
</script>

<button
	onclick={() => {
		'arrow body';
		calls += declared();
	}}>arrow {calls}</button
>
<button
	onclick={function () {
		'function expression';
		calls += 1;
	}}>function {calls}</button
>
