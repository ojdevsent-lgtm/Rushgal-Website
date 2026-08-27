// Final V1 cleanup: tracking was intentionally removed from the Rushgal scope.
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a,button').forEach(el => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 'track order' || text === 'track my order') el.remove();
    });
    ['trackingModal','trackOrderModal','trackingResult','trackingBody'].forEach(id => document.getElementById(id)?.remove());
  });
})();
