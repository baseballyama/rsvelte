<script lang="ts" context="module">
	import { columns } from './a';
</script>
<script lang="ts">
	import { canWrite } from './b';
</script>
<p>{$columns}{$canWrite}</p>