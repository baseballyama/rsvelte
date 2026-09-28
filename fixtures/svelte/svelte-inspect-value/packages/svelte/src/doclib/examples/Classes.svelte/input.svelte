<script lang="ts">
  import Inspect from '$lib/index.js'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'

  class Greeter {
    static staticProperty = 'HI'
    static get something() {
      return 'something'
    }
    iHaveAProperty = 'hello'
    private name: string

    constructor(name: string) {
      this.name = name
    }

    // eslint-disable-next-line no-console
    public greet = () => console.log(`${Greeter.staticProperty} ${this.name}`)

    public method() {
      return 'hei'
    }

    toString() {
      return 'nonononono'
    }
  }

  getContext<SvelteMap<string, string>>('toc')?.set('Classes', 'classes')
</script>

<div class="flex col">
  <h3 id="classes">Classes</h3>
  <p>Display "static" properties of classes</p>

  <Inspect.Values.Expand0 {...{ class: Greeter, classInstance: new Greeter('world') }} />
</div>
