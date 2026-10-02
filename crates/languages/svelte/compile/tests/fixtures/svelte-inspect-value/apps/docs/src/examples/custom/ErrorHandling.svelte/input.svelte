<script lang="ts">
  import Inspect from '@components/Inspect.svelte'
  import ErrorOnHover from './ErrorOnHover.svelte'
</script>

<Inspect
  value={{
    'clickToError👉': 'click me',
    hey: 'dont click me i will error',
  }}
  name="customString"
  customComponents={{ string: [ErrorOnHover] }}
/>
