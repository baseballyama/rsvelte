<script lang="ts">
  import { Inspect } from '@components'

  let div = $state()

  let width = $state(500)
  let classes = $state('radius')
  let testid = $state('demo-div')

  let group = $state<'simple' | 'full'>('simple')
</script>

<div bind:this={div} class="demo-div {classes}" style="width: {width}px;" data-testid={testid}>
  <label>
    testid
    <input type="text" bind:value={testid} />
  </label>
  <label>
    width
    <input type="number" bind:value={width} step="10" max="1000" min="450" />
  </label>
  <label>
    extra class
    <select bind:value={classes}>
      <option></option>
      <option>red</option>
      <option>blue</option>
      <option>radius</option>
    </select>
  </label>

  <ul>
    {#each { length: 100 }, i (i)}
      <li>{i}</li>
    {/each}
  </ul>

  <ul class="horiz">
    {#each { length: 100 }, i (i)}
      <li>{i}</li>
    {/each}
  </ul>
</div>

<Inspect
  value={div}
  name="htmlElement"
  class="not-content mt"
  expandLevel={1}
  elementView={group}
/>

<div class="input-row">
  <fieldset class="not-content">
    <legend>Element View</legend>
    <label>
      <input type="radio" bind:group value="simple" />
      <span>simple</span>
    </label>
    <label>
      <input type="radio" bind:group value="full" />
      <span>full</span>
    </label>
  </fieldset>
</div>

<style>
  fieldset {
    display: flex;
    gap: 1em;
    width: fit-content;
    font-family: var(--sl-font-sans);

    label {
      display: inline-flex;
      flex-direction: row;
      gap: 1em;
    }
  }

  .demo-div {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;
    transition: all 0.2s ease-in-out;
    margin-inline: auto;
    background-color: cadetblue;
    padding: 0.5rem;
    height: 150px;
    overflow: auto;
    font-family: monospace;
    text-wrap: nowrap;

    input {
      max-width: 50%;
    }

    input,
    select {
      height: 30px;
    }

    &.red {
      background-color: pink;
      color: black;
    }

    &.blue {
      background-color: lightblue;
      color: black;
    }

    &.radius {
      border-radius: 16px;
      color: black;
    }
  }

  .horiz {
    li {
      display: inline;
      margin-left: 2ch;
      list-style-type: none;
    }
  }
</style>
