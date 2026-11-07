<script lang="ts">
	function hello() {
		console.log('Hello');
	}
</script>

{@render foo({ onclick: hello })}

{#snippet foo(o: {onclick: () => void})}
  <button on:click={o.onclick}>Click me</button>
{/snippet}
