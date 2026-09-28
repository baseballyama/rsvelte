<script lang="ts">
  import type { PageData } from './$types.js'

  let { data }: { data: PageData } = $props()
</script>

<data.content />
