<script>import Comp from './C.svelte'; let b='x';</script>
<Comp><div slot="a{b}c" let:x>{x}</div></Comp>