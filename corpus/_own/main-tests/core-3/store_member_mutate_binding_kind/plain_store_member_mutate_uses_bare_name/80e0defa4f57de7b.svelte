<script>
import { writable } from 'svelte/store';
const obj = writable({ a: 1 });
function f() { $obj.a = 2; }
</script>