/* 
  Raymundo Paz
  April 2024
*/

export function initNavigationMenu(): void {
  const navItems = document.querySelectorAll('nav > button.sidebar-button') as NodeListOf<HTMLElement>;

  for (let i = 0; i < navItems.length; i++) {
    const navItem = navItems[i];
    const target = navItem.getAttribute('data-target');

    if (target === 'container') {
      navItem.onclick = (): void => {
        const targetIndex = navItem.getAttribute('data-target-index');
        selectContainer(targetIndex);
      };
    } else {
      navItem.onclick = (): void => {
        console.log('something');
      };
    }
  }
}

export function selectContainer(targetIndex: string | number): void {
  const containers = document.querySelectorAll('div.content > div.container') as NodeListOf<HTMLElement>;
  const navItems = document.querySelectorAll('nav > button.sidebar-button') as NodeListOf<HTMLElement>;

  for (let i = 0; i < containers.length; i++) {
    const container = containers[i];
    const containerIndex = container.getAttribute('data-index');

    if (containerIndex === `${targetIndex}`) {
      container.style.display = 'flex';
    } else {
      container.style.display = 'none';
    }
  }

  for (let i = 0; i < navItems.length; i++) {
    const navItem = navItems[i];
    const dataTargetIndex = navItem.getAttribute('data-target-index');

    if (dataTargetIndex === `${targetIndex}`) {
      navItem.classList.add('active');
    } else {
      navItem.classList.remove('active');
    }
  }
}

