<script>import {writable} from 'svelte/store';
let x = writable(0);
let y = 0;
$: if ($x) y = 1;</script>{y}