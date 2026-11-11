<script>
  let enabled = $state(false);
  let observed = $state('');
  function sample() {
    observed = JSON.stringify(Array.from(document.querySelectorAll('[data-sample]'), element =>
      ['class', 'style'].map(name => {
        const value = element.getAttribute(name);
        return value === null ? null : encodeURIComponent(value);
      })));
  }
</script>
<p data-sample class=" a  b 
 c " style=" color: red;  background: blue ">static</p>
<p data-sample class=" a  b 
 c " class:b={enabled} style=" color: red;  background: blue " style:color={enabled ? 'green' : 'red'}>directives</p>
<p data-sample class="" style="">empty</p>
<p data-sample style="margin: 2px; color: red;" style:margin-left={enabled ? '3px' : '4px'}>longhand</p>
<p data-sample style="margin-left: 2px; color: red;" style:margin={enabled ? '3px' : '4px'}>shorthand</p>
<button onclick={sample}>sample</button>
<button onclick={() => enabled = !enabled}>toggle</button>
<output>{observed}</output>
