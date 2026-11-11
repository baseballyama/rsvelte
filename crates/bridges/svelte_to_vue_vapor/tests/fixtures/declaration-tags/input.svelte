<script>
  let user = $state({name: 'first'});
  let editing = $state(false);
</script>
{const label = 'root'}
{const {name: initial, missing = 'fallback', ...rest} = user}
{let [first, , ...others] = [1, 2, 3, 4]}
<p>{initial}:{missing}:{Object.keys(rest).length}:{first}:{others.join(',')}</p>
<p>{label}:{user.name}</p>
<button onclick={() => editing = !editing}>edit</button>
{#if editing}
  {let name = $state(user.name)}
  {const greeting = $derived(`Hello ${name}`)}
  {const label = 'local'}
  <input bind:value={name} />
  <p>{label}:{greeting}</p>
  <button onclick={() => { user.name = name; editing = false; }}>save</button>
{/if}
