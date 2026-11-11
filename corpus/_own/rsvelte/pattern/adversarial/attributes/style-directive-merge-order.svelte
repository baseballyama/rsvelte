<script>
  let color = $state("red");
  const spread = { style: "border: 1px solid black" };
</script>

<div style="color: blue" style:color>a</div>
<div style="color: blue; margin: 0" style:background={color}>b</div>
<div style:color={null}>c</div>
<div style:color={undefined}>d</div>
<div style:color style:background={color}>e</div>
<div style:--custom={color} style:width="1px">f</div>
<div {...spread} style="color: green">g</div>
<div style="color: green" {...spread}>h</div>
<div style={`color: ${color}`}>i</div>
<div style="">j</div>
