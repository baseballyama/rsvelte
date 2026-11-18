<script>
  let color = $state("red");
  let size = $state(4);
</script>

<div style:color>a</div>
<div style:color>b</div>
<div style:--custom="1">c</div>
<div style:--custom={size}>d</div>
<div style:--a="1" style:--b={size} style:color style:background-color="blue">
  e
</div>
<div style="color: {color}; --inline: {size}px">f</div>
<div style="color: red" style:background="blue" style:--mixed={size}>g</div>
<div style:grid-template-columns="repeat({size}, 1fr)">h</div>
<div style:font-family={'"Local", serif'}>i</div>
