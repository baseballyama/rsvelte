<script>import {writable} from 'svelte/store';
let x = writable(0);
function log(v){}
$: { log($x); }</script>