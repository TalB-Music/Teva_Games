// Add a game here and it appears in the portal. Each game lives in games/<id>/.
// Eggs that haven't hatched yet stand in for games still to come.
(function () {
  const T = (window.Teva = window.Teva || {});
  T.games = [{ id: 'dino-pet', name: 'Dino friend', href: 'games/dino-pet/index.html', art: 'dino' }];
  T.comingSoonEggs = [
    { shell: '#FFE9F0', spot: '#B79BEA', spot2: '#FFD84D' },
    { shell: '#E6FAFF', spot: '#FF9A5C', spot2: '#35C9A5' },
  ];
})();
