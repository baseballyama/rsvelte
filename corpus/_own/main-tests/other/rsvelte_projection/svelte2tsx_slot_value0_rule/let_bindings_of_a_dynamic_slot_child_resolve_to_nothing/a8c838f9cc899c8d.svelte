<script>import Comp from './C.svelte'; let n='x';</script>
<Comp><div slot={n} let:x><slot name="s" p={x} /></div></Comp>