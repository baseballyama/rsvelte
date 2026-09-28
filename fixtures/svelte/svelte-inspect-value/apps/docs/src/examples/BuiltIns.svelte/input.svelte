<script lang="ts">
  import { Inspect } from '@components'

  let values = [
    new Date(),
    new Map([
      ['one', 1],
      ['two', 2],
      ['three', 3],
    ]),
    new Set(['one', 'two', 'three']),
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,
    new URL('https://inspect.eirik.space/guides/examples?q=query#basics'),
    new URLSearchParams([
      ['a', '1'],
      ['a', '2'],
      ['b', '3'],
      ['b', '4'],
      ['c', '5'],
      ['query', 'elephants'],
    ]),
    {
      typedArrays: [
        new Uint8Array([1, 2, 3]),
        new Uint16Array([4, 5, 6]),
        new Uint32Array([7, 8, 9]),
        new BigInt64Array([10n, 11n, 12n]),
      ],
    },
    new Error('error view'),
  ]
</script>

<Inspect {values} expandLevel={0}></Inspect>
