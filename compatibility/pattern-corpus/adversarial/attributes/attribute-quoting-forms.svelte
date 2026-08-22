<script>
  let value = $state("v");
  const spread = { "data-spread": 1 };
</script>

<div id="unquoted"></div>
<div id="single"></div>
<div id="double"></div>
<div id={value}></div>
<div id={value}></div>
<div id={value}></div>
<div id="prefix-{value}-suffix"></div>
<div id="prefix-{value}"></div>
<div data-empty=""></div>
<div data-empty></div>
<div data-a="1" data-b="2" data-c="3" data-d={4}></div>
<div {...spread} id="after-spread"></div>
<div id="before-spread" {...spread}></div>
<div {value}></div>
<div {...spread} {value} id={value}></div>
