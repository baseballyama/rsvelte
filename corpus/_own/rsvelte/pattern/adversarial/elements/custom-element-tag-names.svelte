<script>
  let value = $state("v");
</script>

<my-element>a</my-element>
<my-element attr="1" data-b={value}>b</my-element>
<x-y-z></x-y-z>
<a-1 data-c="1"></a-1>
<my-element-with-a-long-name>c</my-element-with-a-long-name>
<button is="my-button">d</button>
<div is="my-div" data-e={value}>e</div>
<my-element>
  <span slot="named">f</span>
  <span>g</span>
</my-element>
