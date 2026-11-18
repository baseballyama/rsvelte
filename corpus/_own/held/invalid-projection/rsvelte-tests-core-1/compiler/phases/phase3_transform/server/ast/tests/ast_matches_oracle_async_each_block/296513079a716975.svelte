{#each await Promise.resolve([first, second, third]) as item}
  {await item}
{/each}
