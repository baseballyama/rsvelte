{#each items as obj}
  {@const { a = "\\" } = obj}
  <p>{a}</p>
{/each}
