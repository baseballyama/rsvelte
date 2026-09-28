<script lang="ts">
  import Inspect from '$lib/Inspect.svelte'

  let data = { a: `{}`, b: `[`, c: '[ "a", "b", "c", 1, 2, 3, true,false, { "a": [1,2,3] } ]' }
  let nestedData = {
    a: `{}`,
    b: {
      a: `{}`,
      b: `[`,
      b2: `{`,
      c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
      d: JSON.stringify(data),
      e: {
        a: `{}`,
        b: `[`,
        b2: `{`,
        c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
        d: JSON.stringify(data),
        e: {},
      },
    },
    b2: `{`,
    c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
    d: JSON.stringify(data),
    e: {
      a: {
        a: `{}`,
        b: `[`,
        b2: `{`,
        c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
        d: JSON.stringify(data),
        e: {},
      },
      b: `[`,
      b2: `{`,
      c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
      d: JSON.stringify(data),
      e: {
        a: `{}`,
        b: `[`,
        b2: `{`,
        c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
        d: JSON.stringify(data),
        e: {},
      },
    },
  }
  let expandAll = $state(false)
</script>

<label>
  parse
  <input type="checkbox" bind:checked={expandAll} />
</label>

{#key expandAll}
  <Inspect value={nestedData} parseJson {expandAll} />
{/key}
