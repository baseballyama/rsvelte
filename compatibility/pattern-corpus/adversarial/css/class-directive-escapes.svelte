<script>
	let on = $state(true);
</script>

<div class:is-active={on} class:hover:bg={on} class:a_b-c={on}>x</div>
<div class="w-1/2 md:w-1/3 [&>*]:mt-2">y</div>

<style>
	.is-active {
		color: red;
	}

	.hover\:bg {
		color: blue;
	}

	.a_b-c {
		color: green;
	}

	.w-1\/2 {
		width: 50%;
	}

	.md\:w-1\/3 {
		width: 33%;
	}

	.\[\&\>\*\]\:mt-2 > * {
		margin-top: 0.5rem;
	}
</style>
