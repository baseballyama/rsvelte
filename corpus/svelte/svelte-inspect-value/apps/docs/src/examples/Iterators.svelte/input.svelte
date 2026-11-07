<script lang="ts">
  import { Inspect } from '@components'

  function* fibonacci() {
    let current = 1
    let next = 1
    while (true) {
      yield current
      ;[current, next] = [next, current + next]
    }
  }

  async function* suspensefulFibonacci() {
    let current = 1
    let next = 1
    while (true) {
      await new Promise((resolve) => {
        setTimeout(
          () => {
            resolve(undefined)
          },
          Math.ceil(Math.random() * 1000)
        )
      })
      yield current
      ;[current, next] = [next, current + next]
    }
  }

  let iterators = {
    fibonacci: fibonacci(),
    suspensefulFibonacci: suspensefulFibonacci(),
    array: [1, 2, 3, 4].values(),
    set: new Set([12, 34, 45]).values(),
    map: new Map<unknown, unknown>([
      [0, 0],
      [{ id: 123 }, 1],
      [[1, 2, 3], 2],
      [Symbol('key'), 'value'],
      [
        Promise.resolve('foo'),
        {
          get something() {
            return 'something'
          },
        },
      ],
    ]).entries(),
    stringIterator: 'abdcdefghijklmnopqrstuvwxyzæøå'[Symbol.iterator](),
  }
</script>

<Inspect
  class="not-content mt"
  expandLevel={0}
  previewDepth={20}
  previewEntries={100}
  values={iterators}
/>
