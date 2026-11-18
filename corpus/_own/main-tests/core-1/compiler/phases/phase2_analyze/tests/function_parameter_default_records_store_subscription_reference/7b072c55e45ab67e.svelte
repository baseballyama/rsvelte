<script>
import { writable } from 'svelte/store';
const search_params = writable({ page: 1 });
function goto_page(page = $search_params.page) {}
</script>