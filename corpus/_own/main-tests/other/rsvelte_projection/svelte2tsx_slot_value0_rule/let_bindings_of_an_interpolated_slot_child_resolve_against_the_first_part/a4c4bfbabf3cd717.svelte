<script>import Comp from './C.svelte'; let b='x';</script>
<Comp><div slot="a{b}c" let:x><slot name="s" p={x} /></div></Comp>