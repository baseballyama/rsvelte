<script>
  import Circle from '../component-svg-child/input.svelte';
  let color = $state('red');
  let radius = $state(5);
</script>
<button onclick={() => { color = color === 'red' ? 'blue' : 'red'; radius++; }}>update</button>
<svg><Circle --fill={color} {radius} /></svg>
