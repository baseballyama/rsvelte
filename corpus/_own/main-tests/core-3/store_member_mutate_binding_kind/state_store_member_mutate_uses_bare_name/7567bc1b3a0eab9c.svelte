<script>
import { writable } from 'svelte/store';
let obj = $state(writable({ a: 1 }));
function f() { $obj.a = 2; }
</script>