<script lang="ts">
  import { inspectElement } from '$lib/attachments/inspect-element.js'
  import Inspect from '$lib/index.js'

  let array = $state.raw<number[]>([])

  let asdf = {
    [Symbol('bababa')]: 'hei',
  }

  let num = $state(3)
</script>

<div class="flex row">
  <button onclick={() => (array = [...array, array.length])}>+</button>
  <button onclick={() => (array = array.filter((n) => n !== array.length - 1))}>-</button>
</div>

<Inspect values={{ array }} expandLevel={0} />

<Inspect.Values {array} {...asdf} />

<textarea style="resize: both; max-width: 320px" {@attach inspectElement('resize')}>fififi</textarea
>

<input type="number" bind:value={num} autocomplete="off" {@attach inspectElement('numberInput')} />

<div data-num={num} {@attach inspectElement('datadiv')}></div>

<div contenteditable {@attach inspectElement('editable')}>fafafaf</div>

<ul {@attach inspectElement('list')}>
  {#each array as num (num)}
    <li>{num}</li>
  {/each}
</ul>

<!-- <style>
  .ul-1 {
    background-color: white;
  }
</style> -->
