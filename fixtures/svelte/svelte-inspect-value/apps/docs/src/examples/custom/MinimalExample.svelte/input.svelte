<script lang="ts">
  import { type CustomComponents } from 'svelte-inspect-value'
  import Inspect from '@components/Inspect.svelte'
  import CustomNumber from './CustomNumber.svelte'

  const anObject = {
    oneBillion: 1000000000,
    oneTwoThreeFourEtc: 1234567890,
    etc: [Infinity, NaN],
  }

  const customComponents: CustomComponents = $derived({
    number: [CustomNumber],
  })
</script>

<Inspect class="not-content mt" value={anObject} {customComponents} name="numbersAndColors" />
