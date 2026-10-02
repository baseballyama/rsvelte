<script>
  let people = $state([
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
  ]);
</script>

{#each people as person (person.id)}
  <p>{person.name}</p>
{/each}
