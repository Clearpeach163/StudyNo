  // Hides loader once wallpaper + page are fully loaded
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    document.getElementById('load-bar').style.width = '100%';
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
        // 👇 Trigger your startup animations here
        document.dispatchEvent(new Event('startAnimations'));
      }, 300);
    }, 300);
  });