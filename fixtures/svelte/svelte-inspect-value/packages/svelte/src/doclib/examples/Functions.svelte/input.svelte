<script lang="ts">
  import Inspect from '$lib/index.js'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'

  getContext<SvelteMap<string, string>>('toc')?.set('Functions', 'functions')

  const arrowFunction = eval(`(num) => num * 2`)
  const asyncFn = eval(`async (num) => num * 2`)
  const someFunction = eval(`(function someFunction(some, thing) {
    if (!some) return thing
    const obj = {
      some: thing,
      thing: some,
      [Symbol('oh')]: 'doodle',
    }

    try {
      Math.random()
    } catch {
      const { log } = console
      log('oh no')
      log(obj)
    }
    return some + ' ' + thing
  })`)
  const generator = eval(`(function* fibonacci() {
    let current = 1
    let next = 1
    while (true) {
      yield current
      ;[current, next] = [next, current + next]
    }
  })`)
  const asyncGenerator = eval(`(async function* suspensefulFibonacci() {
  let current = 1
  let next = 1
  while (true) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined)
      }, 1000)
    })
    yield current
    ;[current, next] = [next, current + next]
  }
})`)
</script>

<div class="flex col">
  <h3 id="functions">Functions</h3>
  <p>Display bodies of functions with <code>hljs</code> syntax highlighting.</p>

  <Inspect.Values.Expand0 {arrowFunction} {asyncFn} {someFunction} {generator} {asyncGenerator} />
</div>
