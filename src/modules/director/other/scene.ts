export interface SceneAttributes extends ModuleAttributes {
    name: string;
    description: string;
}

export class Scene {
    public readonly id: string = crypto.randomUUID();
    public readonly name: string;
    public readonly description: string;

    constructor(attributes: SceneAttributes) {
        this.name = attributes.name;
        this.description = attributes.description;
    }
}
