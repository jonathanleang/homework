<script>
  export let videoId = 'wa6Itbqw29g'
  export let src = ''

  $: iframeSrc =
    src && String(src).trim().length > 0
      ? String(src)
      : 'https://www.youtube.com/embed/' + videoId + '?rel=0&modestbranding=1&playsinline=1'
</script>

<div class="wrap">
  <div class="player">
    <iframe
      src={iframeSrc}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </div>
</div>

<style>
  .wrap {
    display: grid;
    gap: 1rem;
    justify-items: center;
    width: 100%;
  }
  .player {
    width: 100%;
    max-width: 960px;
    aspect-ratio: 16 / 9;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    background: #000;
  }
  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
</style>
