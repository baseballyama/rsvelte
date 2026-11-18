<script>
	// The region still owns this comment when the declaration is printed, so the
	// statement's anchor decides whether it flushes before `let` or after it.
	export let a = 1; // a

	/* block */
	export let b = 2; // b

	// two
	// of them
	export let c = 3; // c

	import { onMount } from 'svelte'; // the server hoists the import and leaves this behind

	export let d = 4; // d

	const kept = 5; // trailing a statement that stays in place -- the control
	export let e = 6; // e

	onMount(() => {});
</script>

<p>{a}{b}{c}{d}{e}{kept}</p>
