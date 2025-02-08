//global variable to track the currently held chimes
let currentHeldChimes = null;
let currentChimesSound = null;

//function for spawning new chimes
function createChimes() {
    const chimes = document.createElement('a-entity');
    chimes.setAttribute('gltf-model', '#chimes_model');
    chimes.setAttribute('position', '2 1.5 0');
    chimes.setAttribute('rotation', '0 0 0');
    chimes.setAttribute('scale', '1.5 1.5 1.5');
    chimes.setAttribute('class', 'chimes interactive');
    document.querySelector('a-scene').appendChild(chimes);

    setupChimesInteraction(chimes);
}

//proximity check
function setupChimesInteraction(chimes) {
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

    //update position of held chimes
    function updateChimesPosition() {
        if (currentHeldChimes) {
            //position chimes infront
            const offset = new THREE.Vector3(0, -0.3, -1.5);
            //camera pos
            const cameraWorldPosition = new THREE.Vector3();
            camera.object3D.getWorldPosition(cameraWorldPosition);

            const direction = new THREE.Vector3();
            camera.object3D.getWorldDirection(direction);

            //calculate new pos for chimes
            const newPosition = cameraWorldPosition.clone().add(direction.multiplyScalar(1)).add(offset);
            currentHeldChimes.object3D.position.copy(newPosition);
        }
    }

    AFRAME.registerComponent('chimes-tracker', {
        tick: function () {
            updateChimesPosition();
        }
    });
    chimes.setAttribute('chimes-tracker', '');
}

//functions for picking up and dropping
function pickUpChimes() {
    const player = document.getElementById('player');
    const camera = player.querySelector('a-camera');

    if (!currentHeldChimes) {
        const cameraPosition = new THREE.Vector3();
        camera.object3D.getWorldPosition(cameraPosition);

        const chimesList = document.querySelectorAll('.chimes');
        let closestChimes = null;
        let minDistance = Infinity;

        chimesList.forEach(chimes => {
            const chimesPosition = new THREE.Vector3();
            chimes.object3D.getWorldPosition(chimesPosition);

            const distance = cameraPosition.distanceTo(chimesPosition);

            if (distance < minDistance && distance <= 2) {
                closestChimes = chimes;
                minDistance = distance;
            }
        });

        if (closestChimes) {
            currentHeldChimes = closestChimes; //set closest chimes as the one you hold
            currentChimesSound = new Audio('assets/chimes_sound.mp3');
            currentChimesSound.loop = true;
            currentChimesSound.play();
        } else {
            console.log('No chimes are nearby.');
        }
    }
}

function dropChimes() {
    if (currentHeldChimes) {
        if (currentChimesSound) {
            currentChimesSound.pause(); //stop sound effect
            currentChimesSound.currentTime = 0;
            currentChimesSound = null;
        }
        currentHeldChimes = null;
    }
}

//keyboard event listeners
document.addEventListener('keydown', function (event) {
    if (event.key === 'e' || event.key === 'E') {
        pickUpChimes();
    } 
    else if (event.key === 'r' || event.key === 'R') {
        dropChimes();
    } 
    else if (event.key === 'q' || event.key === 'Q') {
        //delete chimes
        const player = document.getElementById('player');
        const camera = player.querySelector('a-camera');
        const cameraPosition = new THREE.Vector3();
        camera.object3D.getWorldPosition(cameraPosition);

        const chimesList = document.querySelectorAll('.chimes');
        let closestChimes = null;
        let minDistance = Infinity;

        chimesList.forEach(chimes => {
            const chimesPosition = new THREE.Vector3();
            chimes.object3D.getWorldPosition(chimesPosition);

            const distance = cameraPosition.distanceTo(chimesPosition);

            if (distance < minDistance && distance <= 2) {
                closestChimes = chimes;
                minDistance = distance;
            }
        });

        if (closestChimes) {
            if (closestChimes === currentHeldChimes) {
                if (currentChimesSound) {
                    currentChimesSound.pause();
                    currentChimesSound.currentTime = 0;
                    currentChimesSound = null;
                }
                currentHeldChimes = null;
            }
            closestChimes.parentNode.removeChild(closestChimes);
        } else {
            console.log('No chimes to delete.');
        }
    }
});