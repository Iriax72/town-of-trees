const canvas = document.querySelector("#renderCanvas");

const engine = new BABYLON.Engine(canvas, true); 

const createScene = () => {
    /* Scene: */
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.3, 0.9);

    /* Light: */
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    /* Ground: */
    const ground = BABYLON.MexhBuilder.CreateGround("ground", {width: 50, height: 50}, scene);

    /* Player: */
    const player = BABYLON.MeshBuilder.CreateBox("player", {size: 1}, scene);
    player.position.y = 0.5;

    /* Camera: */
    const camera = new BABYLON.FollowCamera("followCam", new BABYLON.Vector3(0, 5, -10), scene);
    camera.lockedTarget = player;
    camera.radius = 10;
    camera.heightOffset = 4;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 10;
    camera.attachControl(canvas, true);
    
    /* Inputs: */
    const inputs = {forward: false, back: false, left: false, right: false};
    window.addEventListener("keydown", (e) => {
        if (e.key === "z" || e.key === "ArrowUp") inputs.forward = true;
        if (e.key === "s" || e.key === "ArrowDown") inputs.back = true;
        if (e.key === "q" || e.key === "ArrowLeft") inputs.left = true;
        if (e.key === "d" || e.key === "ArrowRight") inputs.right = true;
    });
    window.addEventListener("keyup", (e) => {
        if (e.key === "z" || e.key === "ArrowUp") inputs.forward = false;
        if (e.key === "s" || e.key === "ArrowDown") inputs.back = false;
        if (e.key === "q" || e.key === "ArrowLeft") inputs.left = false
        if (e.key === "d" || e.key === "ArrowRight") inputs.right = false;
    });

    /* MaJ of the player's position */
    scene.onBeforeRenderObservable.add(() => {
        const playerSpeed = 0.1;
        if (inputs.forward) player.position.z += playerSpeed;
        if (inputs.back) player.position.z -= playerSpeed;
        if (inputs.left) player.posistion.x -= playerSpeed;
        if (inputs.right) player.position.x += playerSpeed;
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(() => scene.render());

window.addEventListener("resize", () => {
    engine.resize();
});