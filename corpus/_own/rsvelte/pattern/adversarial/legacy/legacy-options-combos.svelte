<svelte:options immutable={true} accessors preserveWhitespace />

<script>
	export let a = 1;
	let b = 2;
	$: c = a + b;
</script>

<pre>  {a}  {c}  </pre>
<p>  spaced   text  </p>
