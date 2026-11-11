<script lang="ts">
import type { Widget } from './types';
import { noop } from './helpers';
let count: number = $state(0);
const read = (value: Widget & { count: number }) => count + value.count;
noop(read);
</script>

<button onclick={() => count++}>{count}</button>
