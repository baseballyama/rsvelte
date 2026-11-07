<script lang="ts">
  import Inspect from '@components/Inspect.svelte'
  import type { InspectProps } from 'svelte-inspect-value'

  let props: InspectProps = $props()

  let values = $state({
    nestedObject: {
      '': 'Try spamming your right arrow key or enter!',
      foo: 'foo',
      bar: 'bar',
      baz: {
        foo: 'foo',
        bar: 'bar',
        baz: { foo: 'foo', bar: 'bar', baz: { foo: 'foo', bar: 'bar', baz: [[[]]] } },
      },
    },
    nestedArray: [1, 2, 3, [4, [5, 6, 7, [8, 9, [0]]]]],
    lorem: 'Try typing "lorem" when another node is focused.\nThis node should be focused.',
  })
</script>

<Inspect {...props} {values} expandLevel={0} typeToFocus disableKeynav={false} />
