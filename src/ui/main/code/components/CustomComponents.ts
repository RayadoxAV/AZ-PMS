class CustomComponent {
  public static isComponent: boolean = true;
  public id: string = '';

  public element: HTMLElement | null = null;

  constructor() { }
  
  public init(): void {
    this.element = document.getElementById(this.id);

    if (!this.element) {
      console.log(`No HTML Element found for id: "${this.id}"`);
      return;
    }
  }
}

export default CustomComponent;
