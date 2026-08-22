<script>
	let kind = $state('primary');
	let extra = $state(true);
</script>

<button class="btn {kind} {extra ? 'extra' : ''}" class:ready={extra}>a</button>
<button class="btn">b</button>
<button class={kind}>c</button>
<button>d</button>

<style>
	.btn {
		padding: 4px;
	}

	.primary {
		color: blue;
	}

	.extra {
		outline: 1px solid;
	}

	.ready {
		cursor: pointer;
	}

	button {
		border: 0;
	}
</style>
