import type { Game } from '../../game';
import { Module, type ModuleAttributes } from '../module';
import type { Scene } from './other/scene';

export interface DirectorAttributes extends ModuleAttributes {
    parent: Game;
}

export class Director extends Module {
    // Lifecycle
    private readonly _scenes = new Map<string, Scene>();
    private _currentScene: Scene | null = null;

    constructor(attributes: DirectorAttributes) {
        super({
            parent: attributes.parent,
            name: 'Director',
            id: 'director',
            description: 'A module responsible for managing game flow, scenes, and transitions',
            version: '1.0.0',
            order: 2,
        });
    }

    // Getters
    public get scenes(): ReadonlyMap<string, Scene> {
        return this._scenes;
    }

    public get currentScene(): Scene | null {
        return this._currentScene;
    }

    // Functions
    public addToScenes(scene: Scene): void {
        this._scenes.set(scene.name, scene);
    }

    public switchToScene(sceneName: string): void {
        const scene = this._scenes.get(sceneName);
        if (!scene) {
            throw new Error(`Scene with name "${sceneName}" does not exist.`);
        }
        this._currentScene = scene;
    }
}
