const fabMenu = document.getElementById('fab-menu');
const menuContainer = document.getElementById('menu-container');

function init() {
  const fabRect = fabMenu.getBoundingClientRect();
  
  menuContainer.style.top = `${fabRect.top + fabRect.height + 16}px`;
  menuContainer.style.left = `${fabRect.left + (fabRect.width / 2 ) - 16}px`;


  fabMenu.addEventListener('click', () => {
    const visibile = menuContainer.style.display === 'flex' ? true : false;

    if (visibile) {
      menuContainer.classList.add('close-menu');
      setTimeout(() => {
        menuContainer.style.display = 'none';
      }, 150);
    } else {
      menuContainer.classList.remove('close-menu');
      menuContainer.style.display = 'flex';
    }
  });
}

init();

