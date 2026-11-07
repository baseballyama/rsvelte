<script lang="ts">
  import Inspect from '$lib/Inspect.svelte'
  import type { SvelteMap } from 'svelte/reactivity'
  // import squirteSprite from './media/squirtle.png'
  import { getContext } from 'svelte'
  import squirtleCry from './media/squirtle_cry.ogg'

  const doAttack = (attack: string) => attack

  const squirtle = {
    name: 'squirtle',
    type: 'water',
    attacks: ['tackle', 'bubble'],
    sprite:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAAQEBApc4NanKRiKQCDKQCLxc205u69agDNeynVlFLVzc3mrFr/1Wr/5pz///8R5ETqAAAAAXRSTlMAQObYZgAAAb1JREFUWMPtlL9KxEAQxi/JC2QvnihaeAkXCwtNBheus7eUPIBZXLGy82ohnZVi4cIl76A2h1ZqJaz2Bxd7C1PoCzgr9jcpBIv9uoX5sfPnm+l0rKysrKz+pwDCdvGjkWxDeBgv5RodWB+dIJCT491D80GLL1wMFm2ACIM5cJlSgYH5YeVWJFRgk0u5z26ADAwM0PukA31M6bgF4JqmHvS+yIBzwjEnAfSUumZqEIHvhZRRbG05iyIMB3uwxkmdjVOW9JTKIOEy8glOxWyC7SyDtCtzCmCMtB9hxcu3kjZrdJJIGVvVsaT1yQWAcV3rRy7AJ3U1hGFZT9UFprWDL8KqsuG7GtfTCJaKTigFYRbVx2vzMX1gk8LFmRPWomoQ0Hp3UkS03f4BSgROgeexmF+6equaaa3PJgsAcU4AqmelVT27uisg5ZLQ3Kqpmlk5u7w/hYTicq80NTw/pRtEgB/VL9glvDPXAMH8jDx5pJXWT+gpY0JGMTjWrB8RCCjxxuDbWqsLBPqMYj8HbZppfc4l9QwEmHnGWES+GxjJfjnaIRNxYlJ3cJNoG8ScnzhHLPb9Thv9glZWVlZWf69vfHii3k2wjfUAAAAASUVORK5CYII=',
    cry: squirtleCry,
    attack: (attack: string) => (attack ? doAttack(attack) : void 0),
    attributes: {
      speed: 20,
      strength: 42,
      defense: 15,
    },
  }

  getContext<SvelteMap<string, string>>('toc')?.set('Media', 'media')
</script>

<div class="flex col">
  <h3 id="media">URL-strings and image/audio links</h3>
  <p>
    If a string is a url and ends with a known file extension for image or audio,<br /> embed the
    media as an <code>img</code> or <code>audio</code>-tag. This is disabled by default.
  </p>

  <Inspect expandAll embedMedia value={squirtle} name="squirtle" />

  <p><em>Sprite and audio courtesy of pokeapi.co</em></p>
</div>
