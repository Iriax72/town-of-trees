const canvas = document.querySelector("#renderCanvas");

const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.3, 0.9);

    return scene
}

const scene = createScene();

engine.runRenderLoop(() => scene.render());