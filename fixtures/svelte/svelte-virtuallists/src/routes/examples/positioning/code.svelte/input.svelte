<script lang="ts">
  import {
    ALIGNMENT,
    SCROLL_BEHAVIOR,
    type VariantScrollConfig,
    type VLRangeEvent,
    type VLSlotSignature
  } from '$lib';
  import { VirtualList } from 'svelte-virtuallists';

  const myModel = $state(new Array(10000));

  // used for the positioning pointers
  let start = $state(0);
  let end = $state(0);

  let scrollToAlignment: ALIGNMENT = $state(ALIGNMENT.AUTO);
  let scrollToBehaviour: SCROLL_BEHAVIOR = $state(SCROLL_BEHAVIOR.SMOOTH);

  let szCalculator: ((index: number, item: unknown) => number) | undefined = $state();

  // holds randomized sizes
  let randSizes: Array<number>;

  function handleVisualRangeChange(event: VLRangeEvent) {
    start = event.start;
    end = event.end;
  }

  let scrollToProps: VariantScrollConfig = $state({});

  function updateScrollToProps(key: 'scrollToIndex' | 'scrollToOffset', value: number | undefined) {
    if (key === 'scrollToIndex') {
      scrollToProps.scrollToIndex = value;
      scrollToProps.scrollToOffset = undefined;
    } else if (key === 'scrollToOffset') {
      scrollToProps.scrollToOffset = value;
      scrollToProps.scrollToIndex = undefined;
    }
  }

  function randomizeSize() {
    randSizes = new Array(myModel.length);
    for (let i = 0; i < randSizes.length; i++) {
      randSizes[i] = Math.round(Math.random() * 65 + 30);
    }

    szCalculator = (_index: number, _item: any) => randSizes[_index];
  }

  function sameSize() {
    szCalculator = () => 25;
  }

  function randomizeContent() {
    for (let i = 0; i < myModel.length; i++) {
      myModel[i] = { text: Math.floor(Math.random() * myModel.length) }; // Random number between 0 and 9999
    }
  }

  function stripItemsBy10() {
    for (let i = 0; i < 10; i++) myModel.pop();
  }

  randomizeContent();
  sameSize();
</script>

<div class="actions">
  <div class="select">
    <span>
      Scroll to row index
      <input
        id="index"
        type="number"
        placeholder="pick an index..."
        class="input"
        value={scrollToProps.scrollToIndex}
        oninput={e => updateScrollToProps('scrollToIndex', Number(e.currentTarget.value))} />
    </span>
  </div>
  <div class="select">
    <span>
      Scroll to pixel offset
      <input
        id="offset"
        type="number"
        placeholder="pick an offset..."
        class="input"
        value={scrollToProps.scrollToOffset}
        oninput={e => updateScrollToProps('scrollToOffset', Number(e.currentTarget.value))} />
    </span>
  </div>
  <div class="select">
    <span>
      Alignment
      <select id="alignment" bind:value={scrollToAlignment}>
        <option value="auto">auto</option>
        <option value="start">start</option>
        <option value="center">center</option>
        <option value="end">end</option>
      </select>
    </span>
  </div>
  <div class="select">
    <span>
      Behaviour
      <select id="behaviour" bind:value={scrollToBehaviour}>
        <option value="auto">auto</option>
        <option value="smooth">smooth</option>
        <option value="instant">instant</option>
      </select>
    </span>
  </div>
</div>

<div style="font-weight: bold">
  <span>Visible Area: start</span>
  <span>{start}</span>
  -
  <span>end</span>
  <span>{end}</span>
</div>

<VirtualList
  items={myModel}
  style="height:500px"
  {...scrollToProps}
  {scrollToAlignment}
  {scrollToBehaviour}
  sizingCalculator={szCalculator}
  onVisibleRangeUpdate={handleVisualRangeChange}>
  {#snippet vl_slot({ index, item, size }: VLSlotSignature<(typeof myModel)[0]>)}
    <div
      style="border: 1px solid rgb(204, 204, 204); line-height: {size}px;"
      class:highlighted={index === scrollToProps.scrollToIndex}>
      #{index}
      {item.text}
    </div>
  {/snippet}
</VirtualList>

<div class="actions">
  <button onclick={randomizeSize} class="button">Randomize row heights</button>
  <button onclick={sameSize} class="button">Same row heights</button>
  <button onclick={randomizeContent} class="button">Randomize content</button>
  <button onclick={stripItemsBy10} class="button">array size -10</button>
</div>

<style>
  .highlighted {
    background: #efefef;
  }
</style>
