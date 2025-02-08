document.body.addEventListener('click', function() {
  const backgroundMusic = document.getElementById('background_music');
  if (backgroundMusic.paused) {
    backgroundMusic.play();
  }
});