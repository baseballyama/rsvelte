<script>
	import * as UI from './ui.js';
	import Base from './Base.svelte';

	const registry = { card: { Body: Base } };
	let which = $state('card');
	const rows = [{ id: 1 }, { id: 2 }];
</script>

<UI.Card.Header title="a" />
<UI.Card.Body>
	<p>body</p>
</UI.Card.Body>

<svelte:component this={registry[which].Body} />
<svelte:component this={which === 'card' ? UI.Card.Body : Base} />

{#each rows as row (row.id)}
	<UI.Card.Row {...row}>
		<svelte:component this={registry.card.Body} id={row.id} />
	</UI.Card.Row>
{/each}
