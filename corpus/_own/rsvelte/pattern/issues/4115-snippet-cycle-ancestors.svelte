<script>
	import Comp from './Comp.svelte';

	let routes = [];
</script>

{#snippet entry(route)}
	<li>
		<Comp>
			{#snippet body()}
				<ul>
					{@render entry(route)}
				</ul>
			{/snippet}
		</Comp>
	</li>
{/snippet}

<nav class="drawer-nav">
	<ul>
		{#each routes as route}
			{@render entry(route)}
		{/each}
	</ul>
</nav>

<style>
	nav.drawer-nav {
		ul {
			color: red;

			ul {
				color: blue;
			}
		}
	}

	nav.drawer-nav li b {
		color: black;
	}
</style>
