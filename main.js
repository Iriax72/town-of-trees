//Intercepteurs d'erreurs
window.onerror = function (message, source, lineno, colno, error) {
    alert("💥 Erreur JS : " + message + "\n" + source + ":" + lineno);
    return false;
};
window.addEventListener("error", (e) => alert("⚠️ " + e.message + "\n" + e.filename), true);
window.addEventListener("unhandledrejection", (e) => alert("🚨 " + e.reason));

function isUserMobile() {
    const ua = navigator.userAgent || window.opera;
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const smallScreen = window.matchMedia("(max-width: 768px)").matches;

    const mobileRegex = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(ua) || (touch && smallScreen);
}

function getPointerPos(e) {
    if(e.touches && e.touches.length > 0) {
        return {x: e.touches[0].clientX, y: e.touches[0].clientY};
    } 
    if(e.clientX !== undefined && e.clientY !== undefined) {
        return {x: e.clientX, y: e.clientY};
    }
    return {x: 0, y: 0};
}

const canvas = document.querySelector("#renderCanvas");

const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
    /* Scene: */
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.3, 0.9);

    /* Light: */
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    /* Ground: */
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 50}, scene);

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
    
    /* ATH: */
    const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    /* Inputs: */
    const inputs = {forward: false, back: false, left: false, right: false};

    if (isUserMobile()) {
        createJoystick(ui);
    } 
    else {
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
    }

    /* MaJ of the player's position */
    const playerSpeed = 0.1
    scene.onBeforeRenderObservable.add(() => {
        // ! ca prend pas en compte le deltatime
        if (inputs.forward) player.position.z += playerSpeed;
        if (inputs.back) player.position.z -= playerSpeed;
        if (inputs.left) player.position.x -= playerSpeed;
        if (inputs.right) player.position.x += playerSpeed;
    });

    return scene;
};

function createJoystick(ui) {
    const joystickContainer = new BABYLON.GUI.Rectangle();
    joystickContainer.width = "120px";
    joystickContainer.height = "120px";
    joystickContainer.thickness = 0;
    joystickContainer.alpha = 0.1;
    joystickContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    joystickContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    joystickContainer.left = "60px";
    joystickContainer.top = "-60px";
    ui.addControl(joystickContainer);
    
    const joystickBase = new BABYLON.GUI.Ellipse();
    joystickBase.width = "100px";
    joystickBase.height = "100px";
    joystickBase.background = "grey";
    joystickBase.thickness = 0;
    joystickBase.alpha = 0.4;
    joystickContainer.addControl(joystickBase);

    const smallJoystick = new BABYLON.GUI.Ellipse();
    smallJoystick.width = "30px";
    smallJoystick.height = "30px";
    smallJoystick.background = "grey";
    smallJoystick.thickness = 0;
    smallJoystick.alpha = 0.8;
    joystickContainer.addControl(smallJoystick);

    joystickBase.onPointerDownObservable.add((coos) => {
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    });

    function onMove(e) {
        const {x, y} = getPointerPos(e);
        const measureBase = joystickBase._currentMeasure;

        const baseCenterX = measureBase.left + measureBase.width/2;
        const baseCenterY = measureBase.top + measureBase.height/2;

        let relX = x - baseCenterX;
        let relY = y - baseCenterY;

        const dist = Math.sqrt(relX ** 2 + relY ** 2);
        const radius = joystickBase.width / 2;
        if (dist > radius) {
            relX = (relX / dist) * radius;
            relY = (relY / dist) * radius;
        }

        smallJoystick.left = relX + smallJoystick._currentMeasure.width/2 + "px";
        smallJoystick.top = relY + smallJoystick._currentMeasure.height/2 + "px";
    };

    function onUp() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        smallJoystick.top = 0;
        smallJoystick.left = 0;
    };
}

const scene = createScene();

engine.runRenderLoop(() => scene.render());

window.addEventListener("resize", () => {
    engine.resize();
});