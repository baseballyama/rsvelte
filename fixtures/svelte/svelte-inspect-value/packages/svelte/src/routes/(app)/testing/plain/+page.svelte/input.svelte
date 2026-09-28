<script>
  import AllTypes from '$doclib/examples/AllTypes.svelte'

  let color = $state('#ffffff')

  let overrides = $state({
    background: '#000000',
    fg: '#FFFFFF',
  })

  // let backgroundColor = $state('transparent')
</script>

<div class="flex">
  <label>
    text color
    <input type="color" bind:value={color} />
  </label>
  <label>
    bg
    <input type="color" bind:value={overrides.background} />
  </label>
  <label>
    fg
    <input type="color" bind:value={overrides.fg} />
  </label>
</div>
<!-- <input type="color" bind:value={backgroundColor} /> -->

<div style="color: {color};padding: 2em;">
  <AllTypes theme="plain" />
</div>

--text-search-highlight-color="hotpink" --text-search-highlight-fg-color="black"
--text-search-highlight-decoration="underline dotted black" --text-search-highlight-border="1px
dotted green"
