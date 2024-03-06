export function initBlockerUI() {
  const optionsFAB = document.getElementById('fab-options');
  optionsFAB.addEventListener('click', () => {
    const menuVisible = window.internalState.optionsMenuVisible;
    window.internalState.optionsMenuVisible = !menuVisible;
  });
}