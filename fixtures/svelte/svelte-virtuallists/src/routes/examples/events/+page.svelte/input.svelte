<script lang="ts">
  import ExampleArea from '$comp/ExampleArea.svelte';
  import example from './code.svelte?example';
</script>

<h2>Events</h2>
<p>Try interacting with the list below and check the event log in the console.</p>
<ExampleArea {example} />
