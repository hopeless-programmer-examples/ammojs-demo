import * as three from "three";
import Ammo from "ammojs-typed";

window.addEventListener(`load`, main);

async function main() {
    const ammo = await Ammo();

    const renderer = new three.WebGLRenderer({ antialias : true });
    const canvas = renderer.domElement;

    document.body.appendChild(canvas);

    const { width, height } = canvas.getBoundingClientRect();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = three.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = three.PCFSoftShadowMap;
    renderer.setSize(width, height);

    const scene = new three.Scene;
    const camera = new three.PerspectiveCamera(70, width / height, 0.1, 100);

    camera.position.set(0, 5, 5);
    camera.rotation.set(-45 / 180 * Math.PI, 0, 0);

    const light = new three.PointLight(`white`, 1, 10);

    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.position.set(0, 5, 0);
    scene.add(light);

    const collisionConfiguration = new ammo.btDefaultCollisionConfiguration;
    const world = new ammo.btDiscreteDynamicsWorld(
        new ammo.btCollisionDispatcher(collisionConfiguration),
        new ammo.btDbvtBroadphase,
        new ammo.btSequentialImpulseConstraintSolver,
        collisionConfiguration,
    );

    world.setGravity(new ammo.btVector3(0, -1, 0));


    class Ground {
        public constructor() {
            const object = new three.Mesh(
                new three.BoxGeometry(10, 1, 10),
                new three.MeshStandardMaterial,
            );
        
            object.castShadow = true;
            object.receiveShadow = true;
            object.position.set(0, -0.5, 0);
            scene.add(object);
            
            const transform = new ammo.btTransform();
        
            transform.setIdentity();
            transform.setOrigin(new ammo.btVector3(0, -0.5, 0));
        
            const shape = new ammo.btBoxShape(new ammo.btVector3(5, 0.5, 5));
            const mass = 0;
            const inertia = new ammo.btVector3(0, 0, 0);
        
            shape.calculateLocalInertia(mass, inertia);
        
            const motion = new ammo.btDefaultMotionState(transform);
            const body = new ammo.btRigidBody(new ammo.btRigidBodyConstructionInfo(mass, motion, shape, inertia));
        
            world.addRigidBody(body);
        }
    }
    class Box {
        private object : three.Object3D;
        private body : Ammo.btRigidBody;

        public constructor() {
            const size = new ammo.btVector3(
                0.1 + Math.random() * 0.6,
                0.1 + Math.random() * 0.6,
                0.1 + Math.random() * 0.6,
            );
            const object = new three.Mesh(
                new three.BoxGeometry(
                    size.x() * 2,
                    size.y() * 2,
                    size.z() * 2,
                ),
                new three.MeshStandardMaterial,
            );
        
            object.castShadow = true;
            object.receiveShadow = true;
            object.position.set(
                -4 + Math.random() * 8,
                2 + Math.random() * 8,
                -4 + Math.random() * 8,
            );
            scene.add(object);

            this.object = object;
            
            const transform = new ammo.btTransform();
        
            transform.setIdentity();
            transform.setOrigin(new ammo.btVector3(
                object.position.x,
                object.position.y,
                object.position.z,
            ));
        
            const shape = new ammo.btBoxShape(size);
            const mass = 1;
            const inertia = new ammo.btVector3(0, 0, 0);
        
            shape.calculateLocalInertia(mass, inertia);
        
            const motion = new ammo.btDefaultMotionState(transform);
            const body = new ammo.btRigidBody(new ammo.btRigidBodyConstructionInfo(mass, motion, shape, inertia));
        
            world.addRigidBody(body);

            this.body = body;
        }

        public Update() {
            const transform = this.body.getWorldTransform();
            const position = transform.getOrigin();

            this.object.position.set(position.x(), position.y(), position.z());

            const rotation = transform.getRotation();

            this.object.rotation.setFromQuaternion(new three.Quaternion(rotation.x(), rotation.y(), rotation.z(), rotation.w()));
        }
    }

    new Ground;

    const boxes : Array<Box> = [];

    for (let i = 0; i < 100; ++i) {
        boxes.push(new Box);
    }

    let date = new Date;

    function render() {
        const now = new Date;

        world.stepSimulation(now.valueOf() - date.valueOf());
        renderer.render(scene, camera);

        for (const box of boxes) {
            box.Update();
        }

        date = now;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    console.log(`done`);
}
