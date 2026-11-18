<script>
  let rows = $state([{ id: 1, choices: [] }, { id: 2, choices: [] }]);
  let choices = $state({ first: [], second: [] });
  let selected = $state('first');
</script>
{#each rows as row (row.id)}
  <input class="a{row.id}" type="checkbox" value="a" bind:group={row.choices} />
  <input class="b{row.id}" type="checkbox" value="b" bind:group={row.choices} />
  <p>{row.id}:{row.choices.join(',')}</p>
{/each}
<input class="dynamic-a" type="checkbox" value="a" bind:group={choices[selected]} />
<input class="dynamic-b" type="checkbox" value="b" bind:group={choices[selected]} />
<button class="switch" onclick={() => selected = selected === 'first' ? 'second' : 'first'}>switch</button>
<button class="replace" onclick={() => rows = [{ id: 2, choices: [] }, { id: 1, choices: ['b'] }]}>replace</button>
<p>{selected}:{choices.first.join(',')}:{choices.second.join(',')}</p>
