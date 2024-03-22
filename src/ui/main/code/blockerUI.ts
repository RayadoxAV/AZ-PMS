/* 
  Raymundo Paz
  March 2024
*/

export function initBlockerUI(): void {
  const optionsFAB = document.getElementById('fab-options');
  optionsFAB.addEventListener('click', () => {
    const menuVisible = window.internalState.optionsMenuVisible;
    window.internalState.optionsMenuVisible = !menuVisible;
  });
}