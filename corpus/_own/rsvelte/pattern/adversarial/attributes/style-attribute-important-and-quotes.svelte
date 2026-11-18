<script>
  let color = $state("red");
</script>

<div style="color: red !important">a</div>
<div style="color: {color} !important; background: blue">b</div>
<div style="content: 'a; b'; color: red">c</div>
<div style="background: url('data:image/svg+xml;utf8,<svg></svg>')">e</div>
<div style="grid-template-areas: 'a b' 'c d'">f</div>
<div style="font-family: 'Local', serif; color: {color}">g</div>
<div style:color="red !important">h</div>
