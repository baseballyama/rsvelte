<script lang="ts">
	let t = 'checkbox';
	const types = { choice: 'radio' };
	types.choice = 'text';
	let value = $state('');
	function change() {
		t = 'text';
	}
</script>

<button onclick={change}>change</button>
<input type={t} bind:value />
<input type={types.choice} bind:value />
<input type={unknown} bind:value />
