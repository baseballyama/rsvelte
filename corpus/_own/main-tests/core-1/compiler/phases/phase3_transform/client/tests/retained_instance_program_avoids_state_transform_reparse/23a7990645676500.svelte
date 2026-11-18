<script>
import { noop } from 'helpers';

let count = $state(0);
const read = () => count;
noop(read);
</script>

<button onclick={() => count++}>{count}</button>
