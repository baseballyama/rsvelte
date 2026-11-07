<script lang="ts">
  import ExampleArea from '$comp/ExampleArea.svelte';

  import example from './code.svelte?example';
</script>

<h2>Positioning</h2>
<p>
  The component provides properties to position the list either on an element, or at a pixel offset.
</p>

<ExampleArea {example} />
