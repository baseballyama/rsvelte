<script>import {writable} from 'svelte/store';
let x = writable(0);
$: doubled = $x * 2;</script>{doubled}