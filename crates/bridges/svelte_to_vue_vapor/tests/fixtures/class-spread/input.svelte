<script>
  let active = $state(false);
  let attributes = $state({ class: 'base active', title: 'first' });
</script>
<button onclick={() => active = !active}>toggle</button>
<button onclick={() => attributes = {class: ['next', {other: true}], title: 'second'}}>replace</button>
<p {...attributes} class:active>spread</p>
<div class="base {active ? 'yes' : 'no'}" class:active>mixed</div>
