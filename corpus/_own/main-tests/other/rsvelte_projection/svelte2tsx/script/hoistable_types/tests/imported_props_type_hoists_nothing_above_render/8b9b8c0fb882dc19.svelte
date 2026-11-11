<script lang="ts">
import type { ImportedProps } from './types';
type Local = { a: number };
let { x }: ImportedProps = $props();
</script>
<div>{x}</div>