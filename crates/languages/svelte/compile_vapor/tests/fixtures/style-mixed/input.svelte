<script>
  let base = $state('color: blue; background: yellow;');
  let color = $state('red');
  let size = $state('12px');
</script>
<button onclick={() => base = 'color: green; border: 1px solid black;'}>base</button>
<button onclick={() => color = null}>remove</button>
<button onclick={() => { color = 'purple'; size = '15px'; }}>restore</button>
<p style={base} style:color style:font-size|important={size}>styled</p>
