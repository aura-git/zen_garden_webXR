//global variable to track the currently held bonsai
let currentHeldBonsai = null;
let currentBonsaiSound = null;

//function for spawning new bonsai trees
function createBonsai() {
    const bonsai = document.createElement('a-entity');
    bonsai.setAttribute('gltf-model', '#bonsai_model');
    bonsai.setAttribute('position', '-2 0.5 0');
    bonsai.setAttribute('rotation', '0 0 0');
    bonsai.setAttribute('scale', '0.07 0.07 0.07');
    bonsai.setAttribute('class', 'bonsai interactive');
    document.querySelector('a-scene').appendChild(bonsai);

    setupBonsaiInteraction(bonsai);
}

//proximity check
function setupBonsaiInteraction(bonsai) {
    const player = document.getElementById('player');
    const camera = player.querySelector('a-camera');
    const pickupDistance = 2; //max distance for picking up

    //calculate distance between two 3D positions
    function calculateDistance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    }

    //update position of held bonsai tree
    function updateBonsaiPosition() {
        if (currentHeldBonsai) {
            //position bonsai infront
            const offset = new THREE.Vector3(0, -1, -1.2);
            //camera pos
            const cameraWorldPosition = new THREE.Vector3();
            camera.object3D.getWorldPosition(cameraWorldPosition);

            const direction = new THREE.Vector3();
            camera.object3D.getWorldDirection(direction);

            //caulcaute new pos for bonsai tree
            const newPosition = cameraWorldPosition.clone().add(direction.multiplyScalar(1)).add(offset);
            currentHeldBonsai.object3D.position.copy(newPosition);
        }
    }

    AFRAME.registerComponent('bonsai-tracker', {
        tick: function () {
            updateBonsaiPosition();
        }
    });
    bonsai.setAttribute('bonsai-tracker', '');
}

//functions for picking up and dropping
function pickUpBonsai() {
    const player = document.getElementById('player');
    const camera = player.querySelector('a-camera');

    if (!currentHeldBonsai) {
        const cameraPosition = new THREE.Vector3();
        camera.object3D.getWorldPosition(cameraPosition);

        const bonsais = document.querySelectorAll('.bonsai');
        let closestBonsai = null;
        let minDistance = Infinity;

        bonsais.forEach(bonsai => {
            const bonsaiPosition = new THREE.Vector3();
            bonsai.object3D.getWorldPosition(bonsaiPosition);

            const distance = cameraPosition.distanceTo(bonsaiPosition);

            if (distance < minDistance && distance <= 2) {
                closestBonsai = bonsai;
                minDistance = distance;
            }
        });

        if (closestBonsai) {
            currentHeldBonsai = closestBonsai; //set closest bonsai as the one you hold
            currentBonsaiSound = new Audio('assets/rustling_sound.mp3');
            currentBonsaiSound.loop = true;
            currentBonsaiSound.play();
        } else {
            console.log('No bonsai is nearby.');
        }
    }
}

function dropBonsai() {
    if (currentHeldBonsai) {
        if (currentBonsaiSound) {
            currentBonsaiSound.pause(); //stop sound effect
            currentBonsaiSound.currentTime = 0;
            currentBonsaiSound = null;
        }
        currentHeldBonsai = null;
    }
}

//keyboard event listeners
document.addEventListener('keydown', function (event) {
    if (event.key === 'e' || event.key === 'E') {
        pickUpBonsai();
    } 
    else if (event.key === 'r' || event.key === 'R') {
        dropBonsai();
    } 
    else if (event.key === 'q' || event.key === 'Q') {
        //delete bonsai
        const player = document.getElementById('player');
        const camera = player.querySelector('a-camera');
        const cameraPosition = new THREE.Vector3();
        camera.object3D.getWorldPosition(cameraPosition);

        const bonsais = document.querySelectorAll('.bonsai');
        let closestBonsai = null;
        let minDistance = Infinity;

        bonsais.forEach(bonsai => {
            const bonsaiPosition = new THREE.Vector3();
            bonsai.object3D.getWorldPosition(bonsaiPosition);

            const distance = cameraPosition.distanceTo(bonsaiPosition);

            if (distance < minDistance && distance <= 2) {
                closestBonsai = bonsai;
                minDistance = distance;
            }
        });

        if (closestBonsai) {
            if (closestBonsai === currentHeldBonsai) {
                if (currentBonsaiSound) {
                    currentBonsaiSound.pause();
                    currentBonsaiSound.currentTime = 0;
                    currentBonsaiSound = null;
                }
                currentHeldBonsai = null;
            }
            closestBonsai.parentNode.removeChild(closestBonsai);
        } else {
            console.log('No bonsai to delete.');
        }
    }
});