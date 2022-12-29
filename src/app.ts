enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];
  
  addEventListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    return this.instance ? this.instance : (this.instance = new ProjectState());
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

abstract class ComponentKit<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!;
    this.hostElement = <T>document.getElementById(hostElementId)!;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = <U>importedNode.firstElementChild;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem extends ComponentKit<HTMLUListElement, HTMLLIElement>{
  private project: Project;

  get persons() {
      return this.project.people === 1 ? '1 person' : `${this.project.people} persons`;
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure(): void {
      
  }

  renderContent(): void {
      this.element.querySelector('h2')!.textContent = this.project.title;
      this.element.querySelector('h3')!.textContent = this.persons + ' assigned.';
      this.element.querySelector('p')!.textContent = this.project.title;
  }
}

class ProjectList extends ComponentKit<HTMLDivElement, HTMLElement>{
  assignedProjects: Project[];

  
    constructor(private type: 'active' | 'finished') {
      super('project-list', 'app', false, `${type}-projects`);
      this.assignedProjects = [];
  
      this.configure();
      this.renderContent();
    }
  
  configure() {
    projectState.addEventListener((projects: Project[]) => {
      const mainProjects = projects.filter((prj) => {
        return this.type === "active" ? 
            prj.status === ProjectStatus.Active
          : prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = mainProjects;
      this.renderProjects();
    });
  }

  
  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
    this.type.toUpperCase() + " PROJECTS";
  }
  private renderProjects() {
    const listElement = <HTMLUListElement>(
      document.getElementById(`${this.type}-projects-list`)!);
      listElement.innerHTML = "";
    for (const projectItem of this.assignedProjects) {
    new ProjectItem(this.element.querySelector('ul')!.id, projectItem)
    }
  }
}

class ProjectInput extends ComponentKit<HTMLDivElement, HTMLFormElement>{
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = <HTMLInputElement>(
      this.element.querySelector("#title")
    );
    this.descriptionInputElement = <HTMLInputElement>(
      this.element.querySelector("#description")
    );
    this.peopleInputElement = <HTMLInputElement>(
      this.element.querySelector("#people")
    );

    this.configure();
  }
  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
  
  renderContent(): void {}

  private collectUserInput(): [string, string, number] | void {
    const entryTitle = this.titleInputElement.value;
    const entryDescription = this.descriptionInputElement.value;
    const entryPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: entryTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: entryDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +entryPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      validate(titleValidatable) &&
      validate(descriptionValidatable) &&
      validate(peopleValidatable)
    ) {
      return [entryTitle, entryDescription, +entryPeople];
    } else {
      alert("Please try again!");
      return;
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.collectUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
}

// app
const projectInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");