<script>
	export let a // no default: nothing inside the call to attach to
	export let b /* no default, block spelling */
	export let c = {} /* synthesized thunk, block spelling */
	let d = {} // the second host: `export { d }` reaches a different port
	let e = {} /* same host, block spelling */
	export { d, e };
</script>

<p>{a}{b}{c}{d}{e}</p>
