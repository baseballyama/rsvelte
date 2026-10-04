<script>
  let active = $state(false);
  let custom = $derived(active ? 'changed' : null);
</script>
<button onclick={() => active = !active}>toggle</button>
<p key={active ? 'second' : 'first'} ref={active ? 'updated' : 'initial'} custom={custom} answer={active ? 42 : false} data-enabled={active}>attributes</p>
<div key="literal" ref="literal" is="plain-element" custom="{active}:value" MixedCase={active ? undefined : 7}>literal attributes</div>
<a href="#" download={active ? 'new.txt' : false} hreflang={active ? null : 'en'}>link</a>
<div contenteditable={active} draggable={active} spellcheck={active} translate={active ? 'yes' : 'no'}>editable</div>
