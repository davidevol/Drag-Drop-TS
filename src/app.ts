// autobind decorator
function autobind(
    _: any,
    _2: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;

    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostElement = <HTMLDivElement>document.getElementById('app')!;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = <HTMLFormElement>importedNode.firstElementChild
        this.element.id = 'user-input'

        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')

        this.configure();
        this.attach();
    }

    private collectUserInput(): [string, string, number] | void {
        const entryTitle = this.titleInputElement.value;
        const entryDescription = this.descriptionInputElement.value;
        const entryPeople = this.peopleInputElement.value;

        if (
            entryTitle.trim().length === 0 ||
            entryDescription.trim().length === 0 ||
            entryPeople.length === 0
          ) {
            alert('Invalid input!');
            return;
          } else {
            return [entryTitle, entryDescription, +entryPeople];
          }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        this.collectUserInput();
        const userInput = this.collectUserInput();

        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
            this.clearInputs();
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const projectInput = new ProjectInput();